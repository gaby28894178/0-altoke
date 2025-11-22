import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

const combosDir = path.resolve(process.cwd(), 'public', 'combos')

async function optimize() {
  try {
    const files = await fs.readdir(combosDir)
    const images = files.filter(f => {
      if (!/\.(png|jpe?g)$/i.test(f)) return false
      // Ignorar derivados con sufijos de tamaño para evitar cascadas
      return !/_(424|640|800)(?:_|\.)/i.test(f)
    })
    const sizes = [424, 640, 800]
    await Promise.all(images.map(async (file) => {
      const input = path.join(combosDir, file)
      const base = file.replace(/\.(png|jpe?g)$/i, '')
      for (const s of sizes) {
        const webpOut = path.join(combosDir, `${base}_${s}.webp`)
        const jpgOut = path.join(combosDir, `${base}_${s}.jpg`)
        const img = sharp(input).resize({ width: s, height: s, fit: 'cover', withoutEnlargement: true }).withMetadata({})
        await img.webp({ quality: 78 }).toFile(webpOut)
        await img.jpeg({ quality: 85, mozjpeg: true }).toFile(jpgOut)
        console.log('Generated', path.basename(webpOut), 'and', path.basename(jpgOut))
      }
    }))
  } catch (err) {
    console.error('Image optimization failed:', err)
    process.exitCode = 0 // don't fail build if optimization fails
  }
}

optimize()