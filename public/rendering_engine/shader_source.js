// vertex shader source
const vertSource =
 `
    attribute vec4 aVertPosition;

    uniform vec4 uResolution;
    uniform mat4 uTransformationMatrix;

    void main()
     {
         vec4 transform = uTransformationMatrix * aVertPosition;         
         vec4 cordToPxl = mat4( 30, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 10, -110, 0, 1 ) * transform;
         vec4 zeroToOne = cordToPxl / uResolution;
         vec4 zeroToTwo = zeroToOne * 2.0;
         vec4 clipSpace = zeroToTwo - 1.0;

         gl_Position = clipSpace * vec4( 1, -1, 0, 1 );
     }
 `;



// fragment shader source
const fragSource =
`
    precision mediump float;

    uniform vec4 uColor;

    void main()
     {
         gl_FragColor = uColor;
     }
`;



export{ vertSource, fragSource };
