const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const bodyparser = require('body-parser')
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')

var dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

var jsonParser = bodyparser.json();
const app = express();

const tableName = 'RaivosInv';
app.use(cors());

app.get("/", function (req, res) {
    res.send({ "stage": "dev" })
})

//♥
app.post("/createEmployee", jsonParser, function (req, res) {
    let id = uuidv4();
    let date = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

    (async () => {
        try {
            let data = {
                "pk": "E_Empleado",
                "sk": id,
                "userNames": req.body.userNames,
                "lastName": req.body.lastName,
                "scndLastName": req.body.scndLastName,
                "gender": req.body.gender,
                "birthday": req.body.birthday,
                "phoneNumber": req.body.phoneNumber,
                "email": req.body.email,
                "password": req.body.password,
                "createdAt": date,
                "changedAt": date
            };

            var params = {
                Item: data,
                ReturnConsumedCapacity: "TOTAL",
                TableName: tableName
            };

            dynamodb.put(params, function (err, response) {
                if (err) res.status(500).send(err);
                else {
                    res.status(200).send(data);
                }
            })
        } catch (error) {
            return res.status(500).send(error);
        }
    })()
});

//◘
app.get("/getAll-Employees", function (req, res) {
    var params = {
        TableName: tableName,
        FilterExpression: "pk = :pk",
        ExpressionAttributeValues: {
            ":pk": "E_Empleado"
        }
    };

    dynamodb.scan(params, function (err, response) {
        if (err) res.status(500).send(err);
        else {
            res.status(200).send(response.Items);
        }
    })
});

//♥
app.get("/getEmployee/:sk", function (req, res) {
    (async () => {
        try {
            var params = {
                TableName: tableName,
                KeyConditionExpression: "pk = :pk AND sk = :sk",
                ExpressionAttributeValues: {
                    ":pk": "E_Empleado",
                    ":sk": req.params.sk
                }
            };

            dynamodb.query(params, function (err, response) {
                if (err) res.status(500).send(err)
                else {
                    res.status(200).send(response.Items)
                }
            })
        } catch (err) {
            res.status(500).send(err)
        }
    })()
});

//♥
app.get("/login/:email", function (req, res) {
    (async () => {
        try {
            var params = {
                TableName: tableName,
                KeyConditionExpression: "pk = :pk",
                ExpressionAttributeValues: {
                    ":pk": "E_Empleado",
                    ":email": req.params.email
                },
                ExpressionAttributeNames: {
                    "#email": "email"
                },
                FilterExpression: "#email = :email"
            };

            dynamodb.query(params, function (err, response) {
                if (err) res.status(500).send(err);
                else if(response.Items.length == 1) {
                    var respuesta = {
                        email: response.Items[0].email,
                        loged: true
                    };
                    res.status(200).send(respuesta);
                }else{
                    var respuesta = {
                        loged: false
                    };
                    res.status(500).send(respuesta);
                }
            });
        } catch (err) {
            res.status(500).send(err);
        }
    })();
});

//♥
app.put("/updateEmployee/:sk", jsonParser, function (req, res) {
    let date = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
    var params = {
        TableName: tableName,
        Key: {
            "pk": "E_Empleado",
            "sk": req.params.sk
        },
        UpdateExpression: "set userNames = :n, lastName = :ln," + 
        "scndLastName = :sln, gender = :g, birthday = :b," +
        "phoneNumber = :pn, email = :e, changedAt = :ch",
        ExpressionAttributeValues: {
            ":n": req.body.userNames,
            ":ln": req.body.lastName,
            ":sln": req.body.scndLastName,
            ":g": req.body.gender,
            ":b": req.body.birthday,
            ":pn": req.body.phoneNumber,
            ":e": req.body.email,
            ":ch": date
        },
        ReturnValues: "UPDATED_NEW"
    };

    dynamodb.update(params, function (err, response) {
        if (err) res.status(500).send(err);
        else {
            res.status(200).send(response);
        }
    });
});

//♥
app.delete("/deleteEmployee/:sk", function(req, res){
    var params = {
        TableName: tableName,
        Key: {
            "pk": "E_Empleado",
            "sk": req.params.sk
        }
    };

    dynamodb.delete(params, function(err, response){
        if (err) res.status(500).send(err)
        else {
            res.status(200).send("Deleted")
        }
    })
});

var server = app.listen(4001, function () {
    console.log("Corriendo en localhost:4001");
});

module.exports.handler = serverless(app);
