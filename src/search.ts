import type { IncomingMessage, ServerResponse } from "node:http";
import fs from "fs";

type User = {
    id : number,
    name : string,
    email : string
}

export const getData = (req : IncomingMessage, res : ServerResponse, myUrl : URL) => {
    res.setHeader('Content-Type', 'application/json');
    const id = myUrl.searchParams.get('id');

    if(req.method === 'GET'){
        fs.readFile("./src/database/data.json", "utf-8", (error, data) => {
            if(error){
                res.statusCode = 404;
                return res.end(JSON.stringify(
                    {
                        message : "404 Not Found"
                    }
                ));
            }

            res.statusCode = 200;
            
            res.end(data);
        });
    }

    else if(req.method === 'POST'){
        let body = "";

        req.on("data", (chunk) => body += chunk);

        req.on("end", () => {
            let newUser;

            try {
                newUser = JSON.parse(body);
            } catch {
                res.statusCode = 400;
                return res.end(JSON.stringify({ message: "Invalid JSON body" }));
            }

            if (!newUser.name || !newUser.email) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ message: "Name and email are required" }));
            }

            fs.readFile('./src/database/data.json', 'utf-8', (error, data)=>{
                if(error){
                    res.statusCode = 404;
                    return res.end(JSON.stringify({
                        message : "404 Not Found"
                    }));
                }

                const users : User[] = JSON.parse(data);
            
                const newUsers : User = {
                    id : users.length + 1,
                    name : newUser.name,
                    email : newUser.email
                }

                users.push(newUsers);

                fs.writeFile('./src/database/data.json', JSON.stringify(users, null, 2), (error) => {
                    if(error){
                        res.statusCode = 404;
                        return res.end(JSON.stringify({ message: "Data Save Failed" }));
                    }

                    res.statusCode = 201;
                    return res.end(JSON.stringify(
                        {
                            message : "Created Successfully",
                            data : newUsers,
                        }
                    ))
                })

            })
        })

        return;
    }

    else if(req.method === 'DELETE'){
        if (!id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({
                message: "ID is required"
            }));
        }

        fs.readFile('./src/database/data.json', 'utf-8', (error, data)=>{
            if(error){
                res.statusCode = 404;
                return res.end(JSON.stringify({
                    message: "404 Not Found"
                }));
            }

            const users : User[] = JSON.parse(data);

            const filterUser = users.filter((user) => user.id !== Number(id));

            if(filterUser.length === users.length){
                res.statusCode = 404;
                return res.end(JSON.stringify({
                    message: "User Not Found"
                }));
            }

            fs.writeFile("./src/database/data.json", JSON.stringify(filterUser, null, 2), (error) => {
                if (error) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({
                        message: "Delete Failed"
                    }));
                }

                res.statusCode = 200;
                return res.end(JSON.stringify({
                    message: "User Deleted Successfully"
                }));
            });
        })

        return;
    }

    else if(req.method === 'PUT'){
        if (!id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({
                message: "ID is required"
            }));
        }
        let body = "";

        req.on("data", (chunk) => {
            body+=chunk;
        });
        req.on("end", () => {
            let newData;

            try {
                newData = JSON.parse(body);
            } catch {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    message: "Invalid JSON body"
                }));
            }

            if (!newData.name || !newData.email) {
                res.statusCode = 400;

                return res.end(JSON.stringify({
                    message: "Name and email are required"
                }));
            }

            fs.readFile('./src/database/data.json', 'utf-8', (error, data) => {
                if(error){
                    res.statusCode = 404;
                    return res.end(JSON.stringify({
                        message : "404 Not Found",
                    }))
                }

                const users : User[] = JSON.parse(data);
                let updatedUser: User | null = null;

                const updateUsers = users.map((user) => {
                    if(user.id === Number(id)){
                        updatedUser = {
                            id : user.id,
                            name: newData.name,
                            email: newData.email, 
                        }
                        return updatedUser;
                    }

                    return user;
                })

                if (!updatedUser) {
                    res.statusCode = 404;
                    return res.end(JSON.stringify({
                        message: "User Not Found"
                    }));
                }


                fs.writeFile("./src/database/data.json", JSON.stringify(updateUsers, null, 2),(error) => {
                    if (error) {
                        res.statusCode = 500;
                        return res.end(JSON.stringify({
                            message: "Update Failed"
                        }));
                    }

                    res.statusCode = 200;
                    return res.end(JSON.stringify({
                        message: "User Updated Successfully",
                        data: updatedUser
                    }));
                });
            })
        })
        
    }else {
        res.statusCode = 405;

        return res.end(JSON.stringify({
            message: "Method Not Allowed"
        }));
    }
}    