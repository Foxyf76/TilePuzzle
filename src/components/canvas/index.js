import Head from 'next/head'
import { Inter } from '@next/font/google'
import { Button, Grid } from '@mui/material'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import { mouseDownListener, mouseUpListener, objectMovingListener } from '../../utils/canvasHelpers'

export default function Canvas({ imageStuff, gameStarted }) {
  const [canvas, setCanvas] = useState(null)
  const [correctOrder, setCorrectOrder] = useState([])
  const [hasContainedTile, setHasContainedTile] = useState(false)

  useEffect(() => {
    setCanvas(new fabric.Canvas('canvas'), { selection: false })
  }, [])

  useEffect(() => {
    if (canvas) {
      const ctx = canvas.getContext('2d')
      let img = new Image()
      img.src = URL.createObjectURL(imageStuff)
      img.onload = () => {
        const fabricImage = new fabric.Image(img)
        canvas.setWidth(img.width)
        canvas.setHeight(img.height)
        canvas.setBackgroundImage(fabricImage, canvas.renderAll.bind(canvas), {
          originX: 'left',
          originY: 'top',
        })
      }
    }
  }, [canvas, imageStuff])

  useEffect(() => {
    if (gameStarted) {
      const padding = 5
      const tileWidth = canvas.getWidth() / 4
      const tileHeight = canvas.getHeight() / 4
      let index = 0
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const ctx = canvas.getContext('2d')
          const imageTileData = ctx.getImageData(x * tileWidth, y * tileHeight, tileWidth, tileHeight)
          const mockCanvas = document.createElement('canvas')
          const mockCanvasCtx = mockCanvas.getContext('2d')

          mockCanvas.width = tileWidth
          mockCanvas.height = tileHeight
          mockCanvasCtx.putImageData(imageTileData, 0, 0)

          fabric.Image.fromURL(mockCanvas.toDataURL('image/png'), (img) => {
            img.set({
              left: x * tileWidth + padding * x + tileWidth / 2,
              top: y * tileHeight + padding * y + tileHeight / 2,
              originX: 'center',
              originY: 'center',
              hasControls: false,
              padding,
              index,
            })

            canvas.add(img)
            index++
          })
        }
      }

      // set the correct order of tiles (it is hardcoded to 16 for now)
      setCorrectOrder([...Array(16).keys()])

      // clear the background image after we've added some tiles
      const image = new fabric.Image('')
      canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas))


    }
  }, [canvas, gameStarted])

  if (canvas) {
    // bit hacky, but fabric is attaching multiple instances of the same event listeners
    // need to limit this to just a single event listener to prevent duplicate events firing
    const listeners = canvas.__eventListeners
    if (listeners === undefined) {
      canvas.on('mouse:up', (event) => mouseUpListener(event, canvas, correctOrder))
      canvas.on('mouse:down', (event) => mouseDownListener(event))
      canvas.on('object:moving', (event) => objectMovingListener(event, canvas))
    }
  }


  return (
    <div style={{ border: '1px solid #30BCED', margin: '20px' }}>
      <canvas id="canvas" style={{ padding: '20px' }} />
    </div>
  )
}