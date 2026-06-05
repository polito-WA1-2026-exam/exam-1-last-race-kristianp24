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

export { check_user_password, retrieve_stations, retrieve_connections, findValidDestinations, getNetworkGraph, retrieve_station }