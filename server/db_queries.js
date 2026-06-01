import sqlite from "sqlite3"
import crypto from "crypto";

function check_user_password(email, password){
    return new Promise((resolve, reject) => {
         const db = new sqlite.Database("db.db", (err) =>
                    {
                        if (err){return reject(err);}
                    } )
        
        const query = "SELECT * FROM users where email = ?"
        db.all(query, [email], (err, row) => {
            db.close()
            if (err){
                reject(err)
            }
            else if (row === undefined ){
                resolve(false)
            }
            else{
                const row1 = row[0]
                const user = {id: row1.id, email: row1.email, name:row1.name}

                crypto.scrypt(password, row1.salt, 64, function(err, hashedPassword) {
                    if (err) reject(err);
                    if(!crypto.timingSafeEqual(Buffer.from(row1.hashedpassword, "hex"), hashedPassword))
                        resolve(false);
                    else
                        resolve(user);
                });
            }
        })
    })
}

export {check_user_password}