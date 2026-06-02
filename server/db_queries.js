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
       db.all(query, (err, rows)=> {
            db.close()
            if (err){
                reject(err)
            }
            else{
                let stations = {}
                for (const row of rows){
                    stations[row.id] = {name: row.name, cx: row.x, cy: row.y, align: row.align }
                }

                resolve(stations)
            }
       })


    })
}

function retrieve_connections_and_lines(){
    return new Promise((resolve, reject) => {
         const db = new sqlite.Database("db.db", (err) => {
            if (err) { return reject(err); }
        })

        const query = "SELECT * from connections c join lines l on c.id_line = l.id"

        db.all(query, (err, rows) => {
            db.close()

            if (err){
                reject(err)
            }
            else{
                resolve(rows)
            }
        })
    })
}

export { check_user_password, retrieve_stations, retrieve_connections_and_lines }