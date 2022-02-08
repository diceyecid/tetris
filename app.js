const express = require( 'express' );
const path = require( 'path' );
const PORT = 5050;
var app = express();

app.use( express.static( path.join( __dirname, 'public' ) ) );
app.set( 'views', path.join( __dirname, 'views' ) );
app.engine('html', require('ejs').renderFile);
app.set( 'view engine', 'ejs' );
app.get( '/', ( req, res ) => res.render( 'index.html' ) );
app.listen( PORT, () => console.log( `Listening on ${ PORT }` ) );
