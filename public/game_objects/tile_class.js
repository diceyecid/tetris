import * as constants from './tile_constants.js';

class Tile
 {
     constructor()
      {
          this.name = '';
          this.color = { r: 0, g: 0, b: 0, a: 0 };
          this.bitmap = [];
          this.initPositions = [];
          this.orientation = 0;
          this.transformationMatrix = mat4.create();
      }



/* tile manipulation functions */

     // translates this tile by (x, y)
     translateTile( x, y )
      {
          mat4.rotateZ( this.transformationMatrix, this.transformationMatrix, constants.degree[ this.orientation ] * -1 );
          mat4.translate( this.transformationMatrix, this.transformationMatrix, [ x, y, 0 ] );
          mat4.rotateZ( this.transformationMatrix, this.transformationMatrix, constants.degree[ this.orientation ] );
      }

     // rotates this tile counterclockwise ( all four orientations )
     rotateTile( a )
      {
          // checks if this tile is a null tile
          if( ['o', 'i', 's', 'z', 'l', 'j', 't'].indexOf( this.name ) == -1 )
           {
               console.error( "Tile is null." );
           }

          // rotate tile
          else
           {
               if( this.orientation == 0 || this.orientation == 1 || this.orientation == 2 )
                {
                    this.orientation++;
                    mat4.rotateZ( this.transformationMatrix, this.transformationMatrix, a );
                    return;
                }
               else if( this.orientation == 3 )
                {
                    this.orientation = 0;
                    mat4.rotateZ( this.transformationMatrix, this.transformationMatrix, a );
                    return;
                }
           }
      }



/* graphic functions */

     // fills buffers to draw this tile
     setTile( gl, shaders )
      {
          gl.bindBuffer( gl.ARRAY_BUFFER, shaders.programInfo.buffer );
          gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.initPositions ), gl.STATIC_DRAW );
      }

     // renders this tile
     renderTile( gl, shaders )
      {
          // clipping
          gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );

          // uses shader program
          gl.useProgram( shaders.program );

          // set resolution
          gl.uniform4f( shaders.programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height, 0, 1 );

          // set transformationMatrix
          gl.uniformMatrix4fv( shaders.programInfo.uniformLocations.transformationMatrix, false, this.transformationMatrix );

          // specifies how to pull data
           {
               gl.bindBuffer( gl.ARRAY_BUFFER, shaders.programInfo.buffer );
               let size = 2;
               let type = gl.FLOAT;
               let normalize = false;
               let stride = 0;
               let offset = 0;
               gl.vertexAttribPointer( shaders.programInfo.attribLocations.vertPosition, size, type, normalize, stride, offset );
               gl.enableVertexAttribArray( shaders.programInfo.attribLocations.vertPosition );
           }

          // draws preimitives
          gl.uniform4f( shaders.programInfo.uniformLocations.color, this.color.r, this.color.g, this.color.b, this.color.a );
           {
               for( let offset = 0; offset < 8 * 3; offset += 3 )
                {
                    gl.drawArrays( gl.TRIANGLES, offset, 3 );
                }
           }

          // draws lines
          gl.uniform4f( shaders.programInfo.uniformLocations.color, 0, 0, 0, 1 );
           {
              for( let offset = 0; offset < 8 * 3; offset += 3 )
               {
                   gl.drawArrays( gl.LINE_STRIP, offset, 3 );
               }
           }

       return;
     }

     // draws this tile (combines filling buffer and render)
     drawTile( gl, shaders )
      {
          this.setTile( gl, shaders );
          this.renderTile( gl, shaders );

          return;
      }



/* getter functions */

     // returns a random tile
     getRandomTile()
      {
          let tiles = [ 'o', 'i', 's', 'z', 'l', 'j', 't' ];
          switch( tiles[ Math.floor( Math.random() * 7 ) ] )
           {
               case 'o': return new OTile();
               case 'i': return new ITile();
               case 's': return new STile();
               case 'z': return new ZTile();
               case 'l': return new LTile();
               case 'j': return new JTile();
               case 't': return new TTile();
           }
      }

      // returns this tile's 4 square positions on game board in an 1D array with given transformation matrix m
     getTransformedPositions( m )
      {
          let transformedPositions = [];

          // gets normalized self bitmap positions
          for( let i = 0; i < 4; i++ )
           {
               for( let j = 0; j < 4; j++ )
                {
                    if( this.bitmap[i][j] == 1 )
                     {
                         transformedPositions.push( j - 2 - 0.5 );
                         transformedPositions.push( i - 1 - 0.5 );
                     }
                }
           }

          // computes offset
          let offset = [ 0.5, 0.5 ]
          let rotationMatrix = mat4.create();
          mat4.copy( rotationMatrix, m );
          rotationMatrix[12] = 0;   // clears x translation
          rotationMatrix[13] = 0;   // clears y translation
          vec4.transformMat4( offset, [ offset[0], offset[1], 0, 1 ], rotationMatrix );

          // transforms into game board bitmap positions
          for( let i = 0; i < 4; i++ )
           {
               let outPositions = vec4.create();
               vec4.transformMat4( outPositions, [ transformedPositions[ i*2 ], transformedPositions[ i*2 + 1 ], 0, 1 ], m );
               transformedPositions[ i*2 ] = Math.round( outPositions[0] + 0.5 + offset[0] );
               transformedPositions[ i*2 + 1 ] = Math.round( outPositions[1] + 0.5 + offset[1] );
           }

          return transformedPositions;
      }

     // returns this tile's 4 square positions on game board in an 1D array
     getAllPositions()
      {
          return this.getTransformedPositions( this.transformationMatrix );
      }

     // returns potential transformation positions for new translation
     getTranslatedPostions( x, y )
      {
          let newTranslationMatrix = [];
          mat4.copy( newTranslationMatrix, this.transformationMatrix );
          mat4.rotateZ( newTranslationMatrix, newTranslationMatrix, constants.degree[ this.orientation ] * -1 );
          mat4.translate( newTranslationMatrix, newTranslationMatrix, [ x, y, 0 ] );
          mat4.rotateZ( newTranslationMatrix, newTranslationMatrix, constants.degree[ this.orientation ] );

          return this.getTransformedPositions( newTranslationMatrix );
      }

     // returns potential transformation positions for new rotation
     getRotatedPositions( a )
      {
          let newTranslationMatrix = [];
          mat4.copy( newTranslationMatrix, this.transformationMatrix );
          mat4.rotateZ( newTranslationMatrix, newTranslationMatrix, a );

          return this.getTransformedPositions( newTranslationMatrix );
      }
 }

class OTile extends Tile
 {
     constructor()
      {
          super();
          this.name = 'o';
          this.color = { r: 1, g: 1, b: 0, a: 1 };
          this.bitmap = constants.oBitmap;
          this.initPositions = constants.oPositions;

          // randomly select starting position
          let startingx = Math.floor( Math.random() * 7 );
          mat4.translate( this.transformationMatrix, this.transformationMatrix, [ 2.5, 1.5, 0 ] );
          mat4.translate( this.transformationMatrix, this.transformationMatrix, [startingx, 0, 0 ] );
      }
 }

class ITile extends Tile
 {
    constructor()
     {
         super();
         this.name = 'i';
         this.color = { r: 0, g: 1, b: 1, a: 1 };
         this.bitmap = constants.iBitmap;
         this.initPositions = constants.iPositions;

         // randomly select starting position
         let startingx = Math.floor( Math.random() * 7 );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ 2.5, 1.5, 0 ] );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ startingx, 0, 0 ] );

         // randomly select starting orientation
         this.orientation = Math.floor( Math.random() * 2 );
         mat4.rotateZ( this.transformationMatrix, this.transformationMatrix, constants.degree[ this.orientation ] );
     }
 }

class STile extends Tile
 {
    constructor()
     {
         super();
         this.name = 's';
         this.color = { r: 0, g: 1, b: 0, a: 1 };
         this.bitmap = constants.sBitmap;
         this.initPositions = constants.sPositions;

         // randomly select starting position
         let startingx = Math.floor( Math.random() * 7 );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ 2.5, 1.5, 0 ] );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ startingx, 0, 0 ] );

         // randomly select starting orientation
         this.orientation = Math.floor( Math.random() * 4 );
         mat4.rotateZ( this.transformationMatrix, this.transformationMatrix, constants.degree[ this.orientation ] );
     }
 }

class ZTile extends Tile
 {
    constructor()
     {
         super();
         this.name = 'z';
         this.color = { r: 1, g: 0, b: 0, a: 1 };
         this.bitmap = constants.zBitmap;
         this.initPositions = constants.zPositions;

         // randomly select starting position
         let startingx = Math.floor( Math.random() * 7 );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ 2.5, 1.5, 0 ] );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ startingx, 0, 0 ] );

         // randomly select starting orientation
         this.orientation = Math.floor( Math.random() * 4 );
         mat4.rotateZ( this.transformationMatrix, this.transformationMatrix, constants.degree[ this.orientation ] );
     }
 }

class LTile extends Tile
 {
    constructor()
     {
         super();
         this.name = 'l';
         this.color = { r: 1, g: 0.5, b: 0, a: 1 };
         this.bitmap = constants.lBitmap;
         this.initPositions = constants.lPositions;

         // randomly select starting position
         let startingx = Math.floor( Math.random() * 7 );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ 2.5, 1.5, 0 ] );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ startingx, 0, 0 ] );

         // randomly select starting orientation
         this.orientation = Math.floor( Math.random() * 4 );
         mat4.rotateZ( this.transformationMatrix, this.transformationMatrix, constants.degree[ this.orientation ] );
     }
 }

class JTile extends Tile
 {
    constructor()
     {
         super();
         this.name = 'j';
         this.color = { r: 0, g: 0, b: 1, a: 1 };
         this.bitmap = constants.jBitmap;
         this.initPositions = constants.jPositions;

         // randomly select starting position
         let startingx = Math.floor( Math.random() * 7 );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ 2.5, 1.5, 0 ] );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ startingx, 0, 0 ] );

         // randomly select starting orientation
         this.orientation = Math.floor( Math.random() * 4 );
         mat4.rotateZ( this.transformationMatrix, this.transformationMatrix, constants.degree[ this.orientation ] );
     }
 }

class TTile extends Tile
 {
    constructor()
     {
         super();
         this.name = 't';
         this.color = { r: 1, g: 0, b: 1, a: 1 };
         this.bitmap = constants.tBitmap;
         this.initPositions = constants.tPositions;

         // randomly select starting position
         let startingx = Math.floor( Math.random() * 7 );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ 2.5, 1.5, 0 ] );
         mat4.translate( this.transformationMatrix, this.transformationMatrix, [ startingx, 0, 0 ] );

         // randomly select starting orientation
         this.orientation = Math.floor( Math.random() * 4 );
         mat4.rotateZ( this.transformationMatrix, this.transformationMatrix, constants.degree[ this.orientation ] );
     }
 }



export{ Tile, OTile, ITile, STile, ZTile, LTile, JTile, TTile };
