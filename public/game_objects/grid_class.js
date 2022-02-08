class Grid
 {
     constructor()
      {
          this.bitmap =
           [
               [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],  // this padding is for convenience, so that actual game area starts at (1, 1)
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],  // extra 4 invisible rows on top for generating tile
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],  // <- this is the first row of the grid drawn
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
               [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],  // <- this is the last row of the grid drawn
               [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],  // initializes with 1 represents the "wall"
           ];
      }



/* gameplay functions */

     // clears a line on the bitmap
     lineClear( line )
      {
          // clears the line
          for( let i = 1; i <= 10; i++ )
           {
               this.bitmap[ line ][ i ] = 0;
           }

          // drop elements above
          for( let i = line; i > 0; i-- )
           {
               for( let j = 1; j <= 10; j++ )
                {
                    this.bitmap[ i ][ j ] = this.bitmap[ i-1 ][ j ];
                }
           }
      }



/* graphic functions */

     // fills buffers to draw a grid
     setGrid( gl, shaders )
      {
          let positions = new Array( 4 * 21 + 4 * 11 );

          // horizontal lines
          for( let i = 0; i < 21; i++ )
           {
               positions[ i * 4 ] = 0;
               positions[ i * 4 + 1 ] = i + 4;
               positions[ i * 4 + 2 ] = 10;
               positions[ i * 4 + 3 ] = i + 4;
           }

          // vertical lines
          for( let i = 0; i < 11; i++ )
           {
               positions[ ( i + 21 ) * 4 ] = i;
               positions[ ( i + 21 ) * 4 + 1 ] = 4;
               positions[ ( i + 21 ) * 4 + 2 ] = i;
               positions[ ( i + 21 ) * 4 + 3 ] = 24;
           }

          gl.bindBuffer( gl.ARRAY_BUFFER, shaders.programInfo.buffer );
          gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( positions ), gl.STATIC_DRAW );
      }

     // renders the grid
     renderGrid( gl, shaders )
      {
          // clipping
          gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );

          // clears canvas
          gl.clearColor( 0, 0, 0, 1 );
          gl.clear( gl.COLOR_BUFFER_BIT );

          // uses shader program
          gl.useProgram( shaders.program );

          // set resolution
          gl.uniform4f( shaders.programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height, 0, 1 );

          // set transformationMatrix
          const transformationMatrix = mat4.create();
          gl.uniformMatrix4fv( shaders.programInfo.uniformLocations.transformationMatrix, false, transformationMatrix );

          // sets color
          gl.uniform4f( shaders.programInfo.uniformLocations.color, 1, 1, 1, 1 );

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

          // draws preimitive
           {
               let count = 2;
               for( let offset = 0; offset < 32 * 2; offset += 2 )
                {
                    gl.drawArrays( gl.LINES, offset, count );
                }
           }

          return;
      }

     // draws the grid (combines filling buffer and render)
     drawGrid( gl, shaders )
      {
          this.setGrid( gl, shaders );
          this.renderGrid( gl, shaders );

          return;
      }
 }



 export{ Grid };
