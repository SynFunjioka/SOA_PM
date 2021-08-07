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
});

//♥
app.post("/createSale", jsonParser, function (req, res) {
    var productos = req.body.productos;
    let id = uuidv4();
    let date = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

    (async () => {
        try {
            let data = {
                "pk": "V_Ventas",
                "sk": "Venta-" + id,
                "numVenta": id,
                "productos": productos,
                "cliente": req.body.cliente,
                "telCliente": req.body.telCliente,
                "createdAt": date
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

//♥
app.get("/getAll-Sales", function (req, res) {
    var params = {
        TableName: tableName,
        FilterExpression: "pk = :pk",
        ExpressionAttributeValues: {
            ":pk": "V_Ventas"
        }
    }

    dynamodb.scan(params, function (err, response) {
        if (err) res.status(500).send(err)
        else {
            res.status(200).send(response)
        }
    })
});

//♥
app.get("/getSale/:sk", function (req, res) {
    (async () => {
        try {
            var params = {
                TableName: tableName,
                KeyConditionExpression: "pk = :pk AND sk = :sk",
                ExpressionAttributeValues: {
                    ":pk": "V_Ventas",
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
app.get("/getSales/user/:cliente", function (req, res) {
    (async () => {
        try {
            var params = {
                TableName: tableName,
                KeyConditionExpression: "pk = :pk",
                ExpressionAttributeValues: {
                    ":pk": "V_Ventas",
                    ":cliente": req.params.cliente,
                },
                ExpressionAttributeNames: {
                    "#cliente": "cliente"
                },
                FilterExpression: "#cliente = :cliente"
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

var server = app.listen(4002, function () {
    console.log("Corriendo en localhost:4002");
});

module.exports.handler = serverless(app);
