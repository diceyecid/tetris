import * as source from '../rendering_engine/shader_source.js';
import { Shaders } from '../rendering_engine/shader_class.js';
import { EventHandler } from '../physics_engine/event_handler_class.js'
import { CollisionDetector } from '../physics_engine/collision_detector_class.js'
import { Grid } from './grid_class.js';
import { Tile } from './tile_class.js';
import { Stack } from './stack_class.js';

class Game
 {
     constructor( gl )
      {
          this.gl = gl;
          this.shaders = new Shaders( source.vertSource, source.fragSource );
          this.eventHandler = new EventHandler( this );
          this.collisionDetector = new CollisionDetector( this );
          this.gameBoard = new Grid();
          this.stack = new Stack();
          this.currentTile = new Tile();
          this.nextTile = new Tile();
          this.animationID = null;
      }



/* gameplay functions */

     // prepares all necessary game elements, ready to start
     initGame()
      {
          this.shaders.initShaderProgram( this.gl );
          this.eventHandler.initEventHandler();
          this.currentTile = this.currentTile.getRandomTile();
          this.nextTile = this.nextTile.getRandomTile();
          this.drawGameBoard();
          this.loadTilePosition();
      }

     // new game
     newGame()
      {
          this.gameBoard = new Grid();
          this.currentTile = new Tile();
          this.nextTile = new Tile();
          this.animationID = null;
      }

     // starts the game
     startGame()
      {
          this.updateFrame();
      }

     // ends the game
     endGame()
      {
          window.cancelAnimationFrame( this.animationID );
          window.addEventListener( "keydown", ( e ) =>
           {
               if( e.keycode == 82 )
                {
                    location.reload();
                }
           } );
      }

     // moves to new tile
     newTile()
      {
          this.currentTile = this.nextTile;
          this.nextTile = this.nextTile.getRandomTile();
      }

     // checks if a line is filled
     isLineFilled( line )
      {
          let count = 0;
          for( let i = 1; i <= 10; i++ )
           {
               if( this.gameBoard.bitmap[ line ][ i ] == 1 )
                {
                    count++;
                }
           }

          if( count == 10 ){ return true; }
          else{ return false; }
      }

     // updates line clear
     updateLineClear()
      {
          let currentPositions = this.currentTile.getAllPositions();

          // computes the y position of the highest and lowest squares
          let top = currentPositions[1];
          let bottom = currentPositions[1];
          for( let i = 3; i < 8; i += 2 )
           {
               if( currentPositions[i] < top ){ top = currentPositions[i]; }
               if( currentPositions[i] > bottom ){ bottom = currentPositions[i]; }
           }

          // clear filled line
          for( let i = top; i <= bottom; i++ )
           {
               if( this.isLineFilled( i ) )
                {
                    this.gameBoard.lineClear( i );
                    this.stack.lineClear( i );
                }
           }
      }



/* physics functions */

     // clears the tile on the game board (use this with loadTilePosition)
     clearTilePosition()
      {
          let currentPositions = this.currentTile.getAllPositions();

          for( let i = 0; i < 4; i++ )
           {
               let boardx = currentPositions[ i*2 ];
               let boardy = currentPositions[ i*2 + 1 ];
               this.gameBoard.bitmap[ boardy ][ boardx ] = 0;
           }
      }

     // loads the tile on the game board (use this with clearTilePosition)
     loadTilePosition()
      {
          let currentPositions = this.currentTile.getAllPositions();

          for( let i = 0; i < 4; i++ )
           {
               let boardx = currentPositions[ i*2 ];
               let boardy = currentPositions[ i*2 + 1 ];
               this.gameBoard.bitmap[ boardy ][ boardx ] = 1;
           }
      }

     // updates tile's horizontal translation on the game board
     // returns true if updated, otherwise returns false
     updateTileHorizontalTranslation( x )
      {
          if( !this.collisionDetector.horizontalTranslationCollision( x ) )
           {
               this.clearTilePosition();
               this.currentTile.translateTile( x, 0 );
               this.loadTilePosition();
               return true;
           }

          return false;
      }

     // updates tile's vertical translation on the game board
     // returns true if updated, otherwise returns false
     updateTileVerticalTranslation( y )
      {
          if( !this.collisionDetector.verticalTranslationCollision( y ) )
           {
               this.clearTilePosition();
               this.currentTile.translateTile( 0, y );
               this.loadTilePosition();
               return true;
           }

          return false;
      }

     //updates tile's rotation on the game board
     // returns true if updated, otherwise returns false
     updateTileRotation( a )
      {
          if( !this.collisionDetector.rotationCollision( a ) )
           {
               this.clearTilePosition();
               this.currentTile.rotateTile( a );
               this.loadTilePosition();
               return true;
           }

          return false;
      }

     // pushes the current tile to the stack and prepares for the next tile
     updateTileToStack()
      {
          this.stack.amount += 4;

          // push line number informations
          let currentPositions = this.currentTile.getAllPositions();
          for( let i = 1; i < 8; i += 2 )
           { this.stack.lineOfSquares.push( currentPositions[i] ); }

          // push square orientation informations
          this.stack.squareOrientations.push( this.currentTile.orientation );
          this.stack.squareOrientations.push( this.currentTile.orientation );
          this.stack.squareOrientations.push( this.currentTile.orientation );
          this.stack.squareOrientations.push( this.currentTile.orientation );

          // push position informations
          for( let i = 0; i < 48; i++ )
           { this.stack.positionBuffer.push( this.currentTile.initPositions[i] ); }

          // push color informations
          this.stack.colorBuffer.push( this.currentTile.color );
          this.stack.colorBuffer.push( this.currentTile.color );
          this.stack.colorBuffer.push( this.currentTile.color );
          this.stack.colorBuffer.push( this.currentTile.color );

          // push matrix informations
          for( let i = 0; i < 4; i++ )
           {
               let matrix = mat4.create();
               mat4.copy( matrix, this.currentTile.transformationMatrix );
               this.stack.matrixBuffer.push( matrix );
           }

          return;
      }

     // checks if end condition meets
     checkEndCondition()
      {
          for( let i = 1; i <= 10; i++ )
           {
               if( this.gameBoard.bitmap[4][i] == 1 ) { return true; }
           }

           return false;
      }




/* graphic functions */

     // draws the game board (a grid)
     drawGameBoard()
      {
          this.gameBoard.drawGrid( this.gl, this.shaders );
      }

     // draws the game board and the current active tile
     drawFrame()
      {
          this.gameBoard.drawGrid( this.gl, this.shaders );
          this.stack.drawStack( this.gl, this.shaders );
          this.currentTile.drawTile( this.gl, this.shaders );
      }

     // draws each frame for game
     updateFrame( prevTime, nowTime )
      {
          // window.cancelAnimationFrame( this.animationID );
          // checks if it's the first call
          if( prevTime === undefined ){ var prevTime = 0; }
          if( nowTime === undefined ){ var nowTime = 0; }

          // draws 1 frame per second
          if( nowTime - prevTime > 1000 )
           {
               prevTime = nowTime;

               // checks if the current tile reaches stack
               if( this.updateTileVerticalTranslation( 1 ) ){ this.drawFrame(); }
               else
                {
                    this.updateTileToStack();
                    this.updateLineClear();
                    if( this.checkEndCondition() ){ this.endGame(); return; }
                    else{ this.newTile(); }
                }

           }
          this.animationID = requestAnimationFrame( ( nowTime ) => { this.updateFrame( prevTime, nowTime ); } );
      }
 }



export{ Game };
