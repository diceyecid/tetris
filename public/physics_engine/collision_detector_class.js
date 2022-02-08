class CollisionDetector
 {
     constructor( game )
      {
          this.game = game;
      }

     // checks if there are potential horizontal collisions for translating current tile in game
     horizontalTranslationCollision( x )
      {
          // checks if this is a real translation
          if( x == 0 || isNaN( x ) ){ return true; }

          // gets the positions
          let currentPositions = this.game.currentTile.getAllPositions();
          let destinationPositions = this.game.currentTile.getTranslatedPostions( x, 0 );

          // computes the y position of the highest and lowest squares
          let top = currentPositions[1];
          let bottom = currentPositions[1];
          for( let i = 3; i < 8; i += 2 )
           {
               if( currentPositions[i] < top ){ top = currentPositions[i]; }
               if( currentPositions[i] > bottom ){ bottom = currentPositions[i]; }
           }

          // computes the leftmost or rightmost sqaures of the tiles for each row
          let edges = [];
          if( Math.sign( x ) == -1 )    // translation to the left
           {
               for( let i = top; i <= bottom; i++ )
                {
                    let temp = [];
                    for( let j = 0; j < 8; j += 2 )
                     {
                         if( currentPositions[ j + 1 ] == i ){ temp.push( currentPositions[ j ] ); }
                     }
                    edges.push( Math.min( ...temp ) );
                }
           }
          else if( Math.sign( x ) == 1 )   // translation to the right
           {
               for( let i = top; i <= bottom; i++ )
                {
                    let temp = [];
                    for( let j = 0; j < 8; j += 2 )
                     {
                         if( currentPositions[ j + 1 ] == i ){ temp.push( currentPositions[ j ] ); }
                     }
                    edges.push( Math.max( ...temp ) );
                }
           }
          else{ console.error( "Parameter error." ); }

          // tests to see if any space is occupied between the current positions and the destination positions
          if( Math.sign( x ) == -1 )    // translation to the left
           {
               let i, j, k;
               for( i = top, k = 0; i <= bottom; i++, k++ )
                {
                    for( let j = edges[k] - 1; j >= edges[k] + x; j-- )
                     {
                         if( this.game.gameBoard.bitmap[ i ][ j ] != 0 ){ return true; }
                     }
                }
           }
          else if( Math.sign( x ) == 1 )    // translation to the right
           {
               let i, j, k;
               for( i = top, k = 0; i <= bottom; i++, k++ )
                {
                    for( let j = edges[k] + 1; j <= edges[k] + x; j++ )
                     {
                         if( this.game.gameBoard.bitmap[ i ][ j ] != 0 ){ return true; }
                     }
                }
           }
          else{ console.error( "Parameter error." ); }

          return false;
      }

     // checks if there are potential vertical collisions for translating current tile in game
     verticalTranslationCollision( y )
      {
          // checks if this is a real translation
          if( y == 0 || isNaN( y ) ){ return true; }

          // gets the positions
          let currentPositions = this.game.currentTile.getAllPositions();
          let destinationPositions = this.game.currentTile.getTranslatedPostions( 0, y );

          // computes the x position of the leftmost and rightmost squares
          let left = currentPositions[0];
          let right = currentPositions[0];
          for( let i = 2; i < 8; i += 2 )
           {
               if( currentPositions[i] < left ){ left = currentPositions[i]; }
               if( currentPositions[i] > right ){ right = currentPositions[i]; }
           }

          // computes the top or bottom sqaures of the tiles for each row
          let edges = [];
          if( Math.sign( y ) == -1 )    // translation towards the sky
           {
               for( let i = left; i <= right; i++ )
                {
                    let temp = [];
                    for( let j = 0; j < 8; j += 2 )
                     {
                         if( currentPositions[ j ] == i ){ temp.push( currentPositions[ j + 1 ] ); }
                     }
                    edges.push( Math.min( ...temp ) );
                }
           }
          else if( Math.sign( y ) == 1 )   // translation towards the ground
           {
               for( let i = left; i <= right; i++ )
                {
                    let temp = [];
                    for( let j = 0; j < 8; j += 2 )
                     {
                         if( currentPositions[ j ] == i ){ temp.push( currentPositions[ j + 1 ] ); }
                     }
                    edges.push( Math.max( ...temp ) );
                }
           }
          else{ console.error( "Parameter error." ); }

          // tests to see if any space is occupied between the current positions and the destination positions
          if( Math.sign( y ) == -1 )    // translation towards the sky
           {
               let i, j, k;
               for( i = left, k = 0; i <= right; i++, k++ )
                {
                    for( let j = edges[k] - 1; j >= edges[k] + y; j-- )
                     {
                         if( this.game.gameBoard.bitmap[ j ][ i ] != 0 ){ return true; }
                     }
                }
           }
          else if( Math.sign( y ) == 1 )    // translation towards the ground
           {
               let i, j, k;
               for( i = left, k = 0; i <= right; i++, k++ )
                {
                    for( let j = edges[k] + 1; j <= edges[k] + y; j++ )
                     {

                         if( this.game.gameBoard.bitmap[ j ][ i ] != 0 ){ return true; }
                     }
                }
           }
          else{ console.error( "Parameter error." ); }

          return false;

      }

     // checks if there are potential collisions for rotating current tile in game
     rotationCollision( a )
      {
          // checks if this is a real rotation
          if( a == 0 || isNaN( a ) ){ return true; }

          // gets the positions
          let currentPositions = this.game.currentTile.getAllPositions();
          let destinationPositions = this.game.currentTile.getRotatedPositions( a );
          let newPositions = [];

          // finds the different positions in current positions and destination positions
          for( let i = 0; i < 4; i++ )
           {
               let count = 0;
               for( let j = 0; j < 4; j++ )
                {
                    if( destinationPositions[ i*2 ] != currentPositions[ j*2 ] ||
                        destinationPositions[ i*2 + 1 ] != currentPositions[ j*2 + 1 ] )
                     {
                         count++;
                     }
                }

               if( count == 4 )
                {
                    newPositions.push( destinationPositions[ i*2 ] );
                    newPositions.push( destinationPositions[ i*2 + 1 ] );
                }
           }

          // checks to see if the destination is occupied
          for( let i = 0; i < newPositions.length; i += 2 )
           {
               if( this.game.gameBoard.bitmap[ newPositions[ i + 1 ] ][ newPositions[ i ] ] == 1 )
                {
                    return true;
                }
           }

          return false;
      }
 }



export{ CollisionDetector };
