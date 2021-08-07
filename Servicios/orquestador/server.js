const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const bodyparser = require('body-parser')
const axios = require('axios')

var jsonParser = bodyparser.json();
const app = express();

//urls
const urlUsuarios = 'https://7o423u0o12.execute-api.us-east-2.amazonaws.com/dev';
const urlProductos = 'https://fqcegcp3w4.execute-api.us-east-2.amazonaws.com/dev';
const urlVentas = 'https://p7pyqgkvu6.execute-api.us-east-2.amazonaws.com/dev';

app.use(cors());

app.get("/", function (req, res) {
    res.send({ "stage": "dev" });
});

/*******USUARIOS */
//!!!
app.get("/getAll-Employees", function (req, res){
    axios.get(urlUsuarios + "/getAll-Employees")
    .then(function(response){
        //console.log(response);
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err)} );
});

//♥
app.get("/getEmployee/:sk", function (req, res){
    axios.get(urlUsuarios + "/getEmployee/" + req.params.sk)
    .then(function(response){
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err)} );
});

//♥
app.get("/login/:email", function (req, res){
    axios.get(urlUsuarios + "/login/" + req.params.email)
    .then(function(response){
        res.status(200).send(response.data);
    }).catch(err => {
        var respuestaErr = [{
            loged: false
        }, err];
        res.status(500).send(respuestaErr);
    });
});

//!!!!
app.post("/createEmployee", jsonParser, function (req, res){
    (async => {
        try{
            let data = {
                "userNames": req.body.userNames,
                "lastName": req.body.lastName,
                "scndLastName": req.body.scndLastName,
                "gender": req.body.gender,
                "birthday": req.body.birthday,
                "phoneNumber": req.body.phoneNumber,
                "email": req.body.email,
                "password": req.body.password,
            };
            axios.post(urlUsuarios + "/createEmployee", data)
            .then(function(response){
                res.status(200).send(response);
            }).catch(err => {res.status(500).send(err);} );
        }catch(err){
            res.status(500).send(err);
        }
    })();
});

//♥
app.put("/updateEmployee/:sk", jsonParser, function(req, res){
    let data = {
        "userNames": req.body.userNames,
        "lastName": req.body.lastName,
        "scndLastName": req.body.scndLastName,
        "gender": req.body.gender,
        "birthday": req.body.birthday,
        "phoneNumber": req.body.phoneNumber,
        "email": req.body.email
    }
    axios.put(urlUsuarios + "/updateEmployee/" + req.params.sk, data)
    .then(function(response){
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err);} );
});

//!!!
app.delete("/deleteEmployee/:sk", function(req, res){
    axios.delete(urlUsuarios + "/deleteEmployee/"+ req.params.sk)
    .then(function(response){
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err);} );
})

//_______________________________

/*************PRODUCTOS**************/

//!!!
app.get("/getAll-Products", function (req, res){
    axios.get(urlProductos + "/getAll-Products")
    .then(function(response){
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err)} );
});

//♥
app.get("/getProductData/:sk", function (req, res){
    axios.get(urlProductos + "/getProductData/" + req.params.sk)
    .then(function(response){
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err)} );
});

//!!◘
app.post("/createProduct", jsonParser, function (req, res){
    (async => {
        try{
            let data = {
                "productName": req.body.productName,
                "description": req.body.description,
                "code": req.body.code,
                "price": req.body.price,
                "provider": req.body.provider,
                "providerPrice": req.body.providerPrice
            };
            axios.post(urlProductos + "/createProduct", data)
            .then(function(response){
                console.log(response.data);
                res.status(200).send(response.data);
            }).catch(err => {res.status(500).send(err)} );

            let dataDos = {
                "code": req.body.code,
            };
            axios.post(urlProductos + "/Inventory/createProduct", dataDos)
            .then(function(responseDos){
                res.status(200).send(responseDos.data);
            });
        }catch(err){
            res.status(500).send(err);
        }
    })();
});

//♥
app.put("/updateProductData/:sk", jsonParser, function(req, res){
    let data = {
        "productName": req.body.productName,
        "description": req.body.description,
        "price": req.body.price,
        "provider": req.body.provider,
        "providerPrice": req.body.providerPrice
    }
    axios.put(urlProductos + "/updateProductData/" + req.params.sk, data)
    .then(function(response){
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err);} );
});

//♥
app.put("/Inventory/productQ/:sk", jsonParser, function(req, res){
    let data = {
        "quantity": req.body.quantity
    }
    axios.put(urlProductos + "/Inventory/productQ/" + req.params.sk, data)
    .then(function(response){
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err);} );
});

//♥
app.delete("/deleteProduct/:sk", function(req, res){
    axios.delete(urlProductos + "/deleteProduct/"+ req.params.sk)
    .then(function(response){
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err);} );
})

//_____________________________________________


app.post("/createSale", jsonParser, function (req, res){
    (async () => {
        try{
            let data = {
                "productos": req.body.productos,
                "cliente": req.body.cliente,
                "telCliente": req.body.telCliente
            };
            await axios.post(urlVentas + "/createSale", data)
            .then(function(response){
                console.log(response.data);
                res.status(200).send(response.data);
            }).catch(err => {res.status(500).send(err); console.log(err);} );

            await UpdateQuantityProducts(req.body.productos);

        }catch(err){
            res.status(500).send(err);
        }
    })();
});

async function UpdateQuantityProducts(products){
    let response = [];
    try {
        for(i = 0; i < products.length; i++){
            console.log("API:", "localhost:4005/Inventory/productQ/" + products[i].code);
            let dataInv = {
                "quantity": products[i].quantity
            }
            response[i] = await axios.put(urlProductos + "/Inventory/productQ/" + products[i].code, dataInv)
                .then(function(response){ 
                    console.log("Ok", response);
                }).catch(err => {res.status(500).send(err);} );
        }
        res.status(200).send(response);
    }catch{

    }
}

//♥
app.get("/getAll-Sales", function (req, res){
    axios.get(urlVentas + "/getAll-Sales")
    .then(function(response){
        //console.log(response);
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err)} );
});

//♥
app.get("/getSale/:sk", function (req, res){
    axios.get(urlVentas + "/getSale/" + req.params.sk)
    .then(function(response){
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err)} );
});

//♥
app.get("/getSales/user/:cliente", function (req, res){
    axios.get(urlVentas + "/getSales/user/" + req.params.cliente)
    .then(function(response){
        res.status(200).send(response.data);
    }).catch(err => {res.status(500).send(err)} );
});

var server = app.listen(4005, function () {
    console.log("Corriendo en localhost:4005");
});

module.exports.handler = serverless(app);