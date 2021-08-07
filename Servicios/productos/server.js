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

//♥◘
app.post("/createProduct", jsonParser, function (req, res) {
    console.log(req.body)
    let id = uuidv4();
    let date = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

    (async () => {
        try {
            let dataProduct = {
                "pk": "I_Inventario",
                //El sk será el código del producto con el prefijo "Product-", puesto que es único
                "sk": "Product-" + req.body.code,
                "productName": req.body.productName,
                "description": req.body.description,
                "code": req.body.code,
                "price": req.body.price,
                "provider": req.body.provider,
                "providerPrice": req.body.providerPrice,
                "createdAt": date,
                "changedAt": date
            };

            var paramsProduct = {
                Item: dataProduct,
                ReturnConsumedCapacity: "TOTAL",
                TableName: tableName
            };
            //---------------

            dynamodb.put(paramsProduct, function (err, response) {
                if (err){
                    console.log('error al agregar datos del producto');
                    console.log(err)
                    res.status(500).send(err);
                }
                else {
                    console.log(dataProduct);
                    res.status(200).send(dataProduct);
                }
            });
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});

//♥◘
app.post("/Inventory/createProduct", jsonParser, function (req, res) {
    console.log(req.body)
    let id = uuidv4();
    let date = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

    (async () => {
        try {
            //---------------
            let dataInv = {
                "pk": "I_Inventario",
                //El sk será el código del producto, puesto que es único
                "sk": "InvProduct-" + req.body.code,
                "code": req.body.code,
                "quantity": 0,
                "createdAt": date,
                "changedAt": date
            };
            var paramsInv = {
                Item: dataInv,
                ReturnConsumedCapacity: "TOTAL",
                TableName: tableName
            };
            //---------------

            dynamodb.put(paramsInv, function (err, response) {
                if (err){
                    console.log('error al agregar datos del producto');
                    res.status(500).send(err);
                }
                else {
                    res.status(200).send(dataInv);
                }
            });
        } catch (error) {
            console.log("Aqui error")
            return res.status(500).send(error);
        }
    })();
});

//!!! - Trae todos los elementos de la tabla y no debe ser así
app.get("/getAll-Products", function (req, res) {
    var params = {
        TableName: tableName,
        KeyConditionExpression: "(pk = 'I_Inventario') AND (begins_with(sk, 'InvProduct'))"
    };

    dynamodb.scan(params, function (err, response) {
        if (err) res.status(500).send(err);
        else {
            res.status(200).send(response);
        }
    });
});

//♥
app.get("/getProductData/:sk", function (req, res) {
    (async () => {
        try {
            var params = {
                TableName: tableName,
                KeyConditionExpression: "pk = :pk AND sk = :sk",
                ExpressionAttributeValues: {
                    ":pk": "I_Inventario",
                    ":sk": "Product-" +  req.params.sk
                },
            };

            dynamodb.query(params, function (err, response) {
                if (err) res.status(500).send(err);
                else {
                    res.status(200).send(response.Items);
                }
            });
        } catch (err) {
            res.status(500).send(err)
        }
    })();
});

//♥ Revisar si el codigo de barras cambie aqui o si se quita
app.put("/updateProductData/:sk", jsonParser, function (req, res) {
    let date = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
    var params = {
        TableName: tableName,
        Key: {
            "pk": "I_Inventario",
            "sk": "Product-" + req.params.sk
        },
        UpdateExpression: "set productName = :pn, description = :d," +
        "price = :p, provider = :pr, providerPrice = :prp, changedAt = :ch",
        ExpressionAttributeValues: {
            ":pn": req.body.productName,
            ":d": req.body.description,
            ":p": req.body.price,
            ":pr": req.body.provider,
            ":prp": req.body.providerPrice,
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


//Cambiar la cantidad de x producto en el inventario
app.put("/Inventory/productQ/:sk", jsonParser, function (req, res) {
    let date = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

    var params = {
        TableName: tableName,
        Key: {
            "pk": "I_Inventario",
            "sk": "InvProduct-" + req.params.sk
        },
        UpdateExpression: "set quantity = quantity + :q, changedAt = :ch",
        ExpressionAttributeValues: {
            ":q": req.body.quantity,
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

app.delete("/deleteProduct/:sk", function(req, res){
    var paramsProduct = {
        TableName: tableName,
        Key: {
            "pk": "I_Inventario",
            "sk": "Product-" + req.params.sk
        }
    };

    var paramsInvP = {
        TableName: tableName,
        Key: {
            "pk": "I_Inventario",
            "sk": "InvProduct-" + req.params.sk
        }
    };

    dynamodb.delete(paramsInvP, function(err, response){
        if (err) res.status(500).send(err);
    });

    dynamodb.delete(paramsProduct, function(err, responseInvP){
        if (err) res.status(500).send(err);
        else{
            res.status(200).send("Deleted");
        }
    });
});

var server = app.listen(4000, function () {
    console.log("Corriendo en localhost:4000")
});

module.exports.handler = serverless(app);
