var express = require("express");
var bodyParser = require("body-parser");
var User = require("./models/user").User;
var session = require("cookie-session");
var router_app = require("./routes");
var session_middleware = require("./middlewares/session");
var app = express(); //Ejecuta express y retorna un objeto

//Colecciones => Tablas
//Documentos => Filas

app.use("/public", express.static("public")); //Permite servir archivos estaticos
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "session",
    keys: ["llave-1", "llave-2"],
  })
);

app.set("view engine", "jade");

app.get("/", function (req, res) {
  console.log(req.session.user_id);
  res.render("index"); //Muestra la vista index, y pasa la variable hola con el valor Hola Ivan
});

app.get("/signup", function (req, res) {
  User.find(function (err, doc) {
    console.log(doc);
    res.render("signup"); //Muestra la vista signup
  }); //Busca usuario
});

app.get("/login", function (req, res) {
  res.render("login"); //Muestra la vista login
}); //Busca usuario

app.post("/users", function (req, res) {
  var user = new User({
    email: req.body.email,
    password: req.body.password,
    password_confirmation: req.body.password_confirmation,
    username: req.body.username,
  });
  user.save().then(
    //Promise, si todo salio bien, guarda los datos
    function (us) {
      res.send("Guardamos tus datos");
    },
    function (err) {
      if (err) {
        console.log(String(err));
        res.send("No pudimos guardar la informacion");
      }
    }
  );
  //Guarda el objeto documento en Mongo, y añade un id
});

app.post("/sessions", function (req, res) {
  User.findOne(
    //Solo trae un documento que coincida con lo solicitado
    { email: req.body.email, password: req.body.password },
    function (err, user) {
      req.session.user_id = user._id;
      //console.log(req.body.email);
      res.redirect("/app");
    }
  );
});

//Primero cojo la sesion, y luego redirigo con router_app
app.use("/app", session_middleware);
app.use("/app", router_app);

app.listen(8080);
