require("dotenv").config();
const express= require("express")
const multer= require("multer")
const path= require("path")

//Cliente que gestiona servicio AWS
const { RekognitionClient, DetectLabelsCommand } = require("@aws-sdk/client-rekognition");

//OPCIONAR (considerarse cuadno se relacione pruebas con FLOCI)
const { mockClient } = require("aws-sdk-client-mock")
const rekognitionMock = mockClient(RekognitionClient)

//Definir la repsuesta eprsonalizada
//Cliente detecte evento, devolverá..
rekognitionMock.on(DetectLabelsCommand).resolves({
  Labels: [
    {Name: 'Hombre', Confidence: 99.4 },
    {Name: 'Niño', Confidence: 95.2 },
    {Name: 'Perro', Confidence: 80.1 },
    {Name: 'Mujer', Confidence: 98.4 },

  ]
})
//Respuesta prueba

const app= express()
const port= process.env.PORT || 3000

//INICIAR EL SERVICIO RECONOCIMIENTO

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
  }
})

//Configuracion multer (upload archivos imagen)
const upload = multer ({ storage: multer.memoryStorage() })

//servicios archivo .html
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

//Ruta para procesar la imagen
//VERBO -> RUTA -> ACCION -> FUNCION ASINCRONA (SOLICITUD, RESPUESTA)
app.post('/api/analizar', upload.single('imagen'), async(req, res)=> {
  try{
    if(!req.file){
      return res.status(400).json({ error: 'No adjuntó una imagen válida' })
    }
    //El buffer de la imagen subida
    const imageBuffer = req.file.buffer
    //configurar el comando para detectar etiquetas (ML Machine Learning)
    const params = {
      Image: {Bytes: imageBuffer },
      MaxLabels: 10,
      MinConfidence: 75
    }
    
    //Instanciar el comando de deteccion
    const command= new DetectLabelsCommand(params)
    const response= await rekognitionClient.send(command)

    //Enviar la repsuesta al front com JSON
    res.json({
      success: true,
      labels: response.Labels || []

    })

  }catch(error){
    console.error(`Error en el servidor AWS:`, error)
    res.status(500).json({
      error: 'No se concretó el analisis en AWS rekognition',
      details: error.message,
      code: error.name
    })
  }
})



//Iniciamos el servidor web
app.listen(port, ()=>{
  console.log(`Servidor ejecutandose en http://localhost:${port}`)
})