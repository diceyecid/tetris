import { degree } from './tile_constants.js';

class Stack
 {
     constructor()
      {
          this.amount = 0;
          this.lineOfSquares = [];      // 1 element / square
          this.squareOrientations = [];  // 1 element / square
          this.positionBuffer = [];     // 12 elements / square
          this.colorBuffer = [];        // 1 element / square
          this.matrixBuffer = [];       // 1 element / square
      }

/* gameplay functions */

     // clears a line of squares
     lineClear( line )
      {
          // clears the line
          for( let i = this.amount - 1; i >= 0; i-- )
           {
               if( this.lineOfSquares[i] == line )
                {
                    this.amount--;
                    this.lineOfSquares.splice( i, 1 );
                    this.squareOrientations.splice( i, 1 );
                    this.positionBuffer.splice( i * 12, 12 );
                    this.colorBuffer.splice( i, 1 );
                    this.matrixBuffer.splice( i, 1 );
                }
           }

          // drop squares above
          for( let j = 0; j < this.amount; j++ )
           {
              if( this.lineOfSquares[j] < line )
               {
                    this.lineOfSquares[j]++;

                    mat4.rotateZ( this.matrixBuffer[j], this.matrixBuffer[j], degree[ this.squareOrientations[j] ] * -1 );
                    mat4.translate( this.matrixBuffer[j], this.matrixBuffer[j], [ 0, 1, 0 ] );
                    mat4.rotateZ( this.matrixBuffer[j], this.matrixBuffer[j], degree[ this.squareOrientations[j] ] );
               }
           }

           return;
      }



/* graphic functions */

     // fills buffers to draw a stack
     setStack( gl, shaders )
      {
          gl.bindBuffer( gl.ARRAY_BUFFER, shaders.programInfo.buffer );
          gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.positionBuffer ), gl.STATIC_DRAW );
      }

     // renders this stack
     renderStack( gl, shaders )
      {
          // clipping
          gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );

          // uses shader program
          gl.useProgram( shaders.program );

          // set resolution
          gl.uniform4f( shaders.programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height, 0, 1 );

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

          // draws squares
           {
               for( let offset = 0; offset < this.amount * 6; offset += 6 )
                {
                    // sets the transformationMatrix
                    gl.uniformMatrix4fv( shaders.programInfo.uniformLocations.transformationMatrix, false, this.matrixBuffer[ offset / 6 ] );

                    // sets to appropiate color fill
                    gl.uniform4f( shaders.programInfo.uniformLocations.color,
                                  this.colorBuffer[ offset / 6 ].r,
                                  this.colorBuffer[ offset / 6 ].g,
                                  this.colorBuffer[ offset / 6 ].b,
                                  this.colorBuffer[ offset / 6 ].a );

                    // draw a sqaure
                    gl.drawArrays( gl.TRIANGLES, offset, 3 );
                    gl.drawArrays( gl.TRIANGLES, offset + 3, 3 );

                    // sets to appropiate color
                    gl.uniform4f( shaders.programInfo.uniformLocations.color, 0, 0, 0, 1 );

                    // draw square boarder
                    gl.drawArrays( gl.LINE_STRIP, offset, 3 );
                    gl.drawArrays( gl.LINE_STRIP, offset + 3, 3 );
                }
           }

       return;
     }

     // draws this stack (combines filling buffer and render)
     drawStack( gl, shaders )
      {
          this.setStack( gl, shaders );
          this.renderStack( gl, shaders );
          return;
      }
 }



export{ Stack };
