import { Game } from '../game_objects/game_class.js';



// main game program
function main()
 {
     // initialize webGL
     const canvas = document.getElementById( 'canvas' );
     const gl = canvas.getContext( 'webgl' );
     if( !gl )
      {
          alert( 'Unable to initialize WebGL.' );
          return;
      }

     let game = new Game( gl );
     game.initGame();
     game.startGame();

     return;
 }



 main();
