import sqlite from "sqlite3"
import crypto from "crypto";

function check_user_password(email, password) {
    return new Promise((resolve, reject) => {
        const db = new sqlite.Database("db.db", (err) => {
            if (err) { return reject(err); }
        })

        const query = "SELECT * FROM users where email = ?"
        db.all(query, [email], (err, row) => {
            db.close()
            if (err) {
                reject(err)
            }
            else if (row === undefined) {
                resolve(false)
            }
            else {
                const row1 = row[0]
                const user = { id: row1.id, email: row1.email, name: row1.name }

                crypto.scrypt(password, row1.salt, 64, function (err, hashedPassword) {
                    if (err) reject(err);
                    if (!crypto.timingSafeEqual(Buffer.from(row1.hashedpassword, "hex"), hashedPassword))
                        resolve(false);
                    else
                        resolve(user);
                });
            }
        })
    })
}

function retrieve_stations() {
    return new Promise((resolve, reject) => {
        const db = new sqlite.Database("db.db", (err) => {
            if (err) { return reject(err); }
        })

        const query = `
        SELECT id, name, x, y,
            CASE 
            WHEN x <= 200 THEN 'end' 
            ELSE 'start' 
            END AS align
        FROM stations
        `;
        db.all(query, (err, rows) => {
            db.close()
            if (err) {
                reject(err)
            }
            else {
                let stations = {}
                for (const row of rows) {
                    stations[row.id] = { name: row.name, cx: row.x, cy: row.y, align: row.align }
                }

                resolve(stations)
            }
        })


    })
}

function retrieve_station(id){
    return new Promise((resolve, reject) => {
        const db = new sqlite.Database("db.db", (err) => {
            if (err) { return reject(err); }
        })

        const query = 'SELECT name from stations where id = ?'

        db.all(query, [id], (err, rows)=> {
            db.close()
            if (err){
                reject(err)
            }
            else{
                resolve(rows[0].name)
            }
        })
    })
}

function retrieve_connections() {
    return new Promise((resolve, reject) => {
        const db = new sqlite.Database("db.db", (err) => {
            if (err) { return reject(err); }
        })

        const query = `
        SELECT s_start.name || ' - ' || s_end.name AS label
        from connections c
        join stations s_start on c.id_station_start = s_start.id
        join stations s_end on c.id_station_end = s_end.id

        UNION

        select s_end.name || ' - ' || s_start.name AS label
        from connections c
        join stations s_start ON c.id_station_start = s_start.id
        join stations s_end ON c.id_station_end = s_end.id;
    `;

        db.all(query, [], (err, rows) => {
            db.close()
            if (err) {
                 reject(err)
            }

            const connectionStrings = rows.map(row => row.label);
            resolve(connectionStrings)
        });
    })
}

async function getNetworkGraph() {
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database("db.db", (err) => {
            if (err) { return reject(err); }
        })
    const query = "SELECT id_station_start as station_a, id_station_end as station_b FROM connections";
    
    db.all(query, [], (err, rows) => {
      if (err) return reject(err);

      const graph = {};
      rows.forEach(row => {
        if (!graph[row.station_a]) graph[row.station_a] = [];
        if (!graph[row.station_b]) graph[row.station_b] = [];
        
        if (!graph[row.station_a].includes(row.station_b)) graph[row.station_a].push(row.station_b);
        if (!graph[row.station_b].includes(row.station_a)) graph[row.station_b].push(row.station_a);
      });
      
      resolve(graph);
    });
  });
}


function findValidDestinations(graph, startStation) {
  const distances = {};
  const queue = [startStation];
  
  distances[startStation] = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    const currentDist = distances[current];

    for (const neighbor of graph[current]) {
      if (distances[neighbor] === undefined) {
        distances[neighbor] = currentDist + 1;
        queue.push(neighbor);
      }
    }
  }

  const validDestinations = [];
  for (const station in distances) {
    if (distances[station] >= 3) {
      validDestinations.push(station);
    }
  }

  return validDestinations;
}

function getStationNameToIdMap() {
  
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database("db.db", (err) => {
            if (err) { return reject(err); }
        })

    db.all("SELECT id, name FROM stations", [], (err, rows) => {
      db.close()
      if (err) return reject(err);
      
      const nameToIdMap = {};
      rows.forEach(row => {
        nameToIdMap[row.name.trim()] = row.id;
      });
      resolve(nameToIdMap);
    });
  });
}

async function validateRouteWithGraph(submittedRoute, assignedStart, assignedDest, graph) {
  
  if (!submittedRoute || submittedRoute.length === 0) {
    return {verdict: false, message: "Validation Failed: Submitted route array is empty."};
  }

  const nameToIdMap = await getStationNameToIdMap();
  const startId = nameToIdMap[assignedStart.trim()];
  const destId = nameToIdMap[assignedDest.trim()];

  const parsedSegments = [];
  for (const segmentStr of submittedRoute) {
    const parts = segmentStr.split('-');
    const idA = nameToIdMap[parts[0].trim()];
    const idB = nameToIdMap[parts[1].trim()];
    
    if (!idA || !idB) {
      return {verdict: false, message: `Validation Failed: Station name inside "${segmentStr}" doesn't exist.`};
    }
    parsedSegments.push({ idA, idB, nameA: parts[0], nameB: parts[1] });
  }

  if (parsedSegments[0].idA !== startId) {
    return {verdict: false, message: `Validation Failed: Must start at assigned station ID ${startId}`};
  }
  if (parsedSegments[parsedSegments.length - 1].idB !== destId) {
    return {verdict: false, message: `Validation Failed: Must end at assigned station ID ${destId}`};
  }

  const usedSegments = new Set();

  for (let i = 0; i < parsedSegments.length; i++) {
    const current = parsedSegments[i];

    if (i > 0 && parsedSegments[i - 1].idB !== current.idA) {
      return {verdict: false, message:`Validation Failed: Broken route continuity between segments.` };
    }

    const neighbors = graph[String(current.idA)] || [];
    
    if (!neighbors.includes(Number(current.idB)) && !neighbors.includes(String(current.idB))) {
      return {verdict: false, message:`Validation Failed: Graph says no track link exists between ${current.idA} and ${current.idB}.` };
    }

    const key1 = `${current.idA}->${current.idB}`;
    const key2 = `${current.idB}->${current.idA}`;
    if (usedSegments.has(key1) || usedSegments.has(key2)) {
      return {verdict: false, message: `Validation Failed: Segment track traversed more than once.`};
    }
    usedSegments.add(key1);
    
  }

  return {verdict: true, message:"The route is perfectly valid"};
}

async function recordScore(userId, score) {
  return new Promise((resolve, reject) => {
    // Open the database connection
    const db = new sqlite.Database("db.db", (err) => {
      if (err) { return reject(err); }
    });
      
    const query = `INSERT INTO Games (userID, score) VALUES (?, ?)`;
    db.run(query, [userId, score], function (err) {
      db.close();

      if (err) {
        return reject({ error: err.message });
      }

      resolve({
        lastId: this.lastID,
        changes: this.changes
      });
    });
  });
}

async function getRandomEvents(numb_events){
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database("db.db", (err) => {
            if (err) { return reject(err); }
        })
    
    const query = `
        SELECT id, description, effect 
        FROM Events 
        ORDER BY RANDOM() 
        LIMIT ?
    `;

        db.all(query, [numb_events], (err, rows) => {
          db.close()
          if (err)
            reject({error: err})
          else{
            let events = {}
            for(const row of rows){
              events[row.id] = {description: row.description, effect: row.effect}
            }
            resolve(events)
          }
        })
    
    
  })
}

async function getScores(){
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database("db.db", (err) => {

            if (err) { return reject(err); }
        })

    const query = `
        SELECT u.id as userID, u.name as username, g.score
        FROM Games g
        JOIN users u ON g.userID = u.id
        ORDER BY g.score DESC
    `;

    db.all(query, [], (err, rows) => {
      db.close()
      if (err) {
        reject({error: err})
      }
      else{
        let scores = []
        for(const row of rows){
          scores.push({userID: row.userID, username: row.username, score: row.score})
        }
        resolve(scores)
      }
    })
  })
}

export { getScores, getRandomEvents, recordScore,getStationNameToIdMap, validateRouteWithGraph, check_user_password, retrieve_stations, retrieve_connections, findValidDestinations, getNetworkGraph, retrieve_station }