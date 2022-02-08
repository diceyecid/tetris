class Shaders
 {
     constructor( vertSource, fragSource )
      {
          this.vertSource = vertSource;
          this.fragSource = fragSource;
          this.program = null;
          this.programInfo =
           {
               attribLocations: null,
               uniformLocations: null,
               buffer: null,
           };
      }

     // creates and compiles a shader
     compileShader( gl, source, type )
      {
          let shader = gl.createShader( type );

          gl.shaderSource( shader, source );
          gl.compileShader( shader );

          let success = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
          if( !success )
           {
               alert( 'Unable to compile shader: ' + gl.getShaderInfoLog( shader ) );
               gl.deleteShader( shader );

               return null;
           }

           return shader;
      }

     // initializes a program from 2 shaders
     initShaderProgram( gl )
      {
          let vertShader = this.compileShader( gl, this.vertSource, gl.VERTEX_SHADER );
          let fragShader = this.compileShader( gl, this.fragSource, gl.FRAGMENT_SHADER );
          this.program = gl.createProgram();

          gl.attachShader( this.program, vertShader );
          gl.attachShader( this.program, fragShader );
          gl.linkProgram( this.program );

          let success = gl.getProgramParameter( this.program, gl.LINK_STATUS );
          if( !success )
           {
               alert( 'Unable to link program: ' + gl.getProgramInfoLog( this.program ) );
               this.program = null;
           }
          else
           {
               // collects program infomations
               this.programInfo.attribLocations =
                {
                    vertPosition: gl.getAttribLocation( this.program, 'aVertPosition' ),
                };

               this.programInfo.uniformLocations =
                {
                    resolution: gl.getUniformLocation( this.program, 'uResolution' ),
                    transformationMatrix: gl.getUniformLocation( this.program, 'uTransformationMatrix' ),
                    color: gl.getUniformLocation( this.program, 'uColor' ),
                };

               // initializes program buffer
               this.programInfo.buffer = gl.createBuffer();
           }
      }
 }



export{ Shaders };
