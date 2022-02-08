class EventHandler
 {
     constructor( game )
      {
          this.game = game;
      }

     initEventHandler()
      {
          window.addEventListener( "keydown", (e) =>
           {
               // disable scrolling with space and arrow keys
               if( [32, 37, 38, 39, 40].indexOf(e.keyCode) > -1 ){ e.preventDefault(); }

               if( e.key == 'ArrowUp' ){ this.arrowUpHandler(); }
               if( e.key == 'ArrowLeft' ){ this.arrowLeftHandler(); }
               if( e.key == 'ArrowRight' ){ this.arrowRightHandler(); }
               if( e.key == 'ArrowDown' ){ this.arrowDownHandler(); }
           } );
      }

     arrowUpHandler()
      {
          console.log( 'up' );
          if( this.game.updateTileRotation( -Math.PI/2 ) ){ this.game.drawFrame(); }
      }

     arrowLeftHandler()
      {
          console.log( 'left' );
          if( this.game.updateTileHorizontalTranslation( -1 ) ){ this.game.drawFrame(); }
      }

     arrowRightHandler()
      {
          console.log( 'right' );
          if( this.game.updateTileHorizontalTranslation( 1 ) ){ this.game.drawFrame(); }
      }

     arrowDownHandler()
      {
          console.log( 'down' );
          if( this.game.updateTileVerticalTranslation( 1 ) ){ this.game.drawFrame(); }
      }

     rHandler( e )
      {
          if( e.key == 'r' || 'R' )
           {
               this.game.newGame();
               this.game.startGame();
               window.removeEventListener( "keydown", this.rHandler );
           }
       }
 }



 export{ EventHandler };
