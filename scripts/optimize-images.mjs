import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

const combosDir = path.resolve(process.cwd(), 'public', 'combos')

async function optimize() {
  try {
    const files = await fs.readdir(combosDir)
    const images = files.filter(f => /\.(png|jpe?g)$/i.test(f))
    await Promise.all(images.map(async (file) => {
      const input = path.join(combosDir, file)
      const webpOut = path.join(combosDir, file.replace(/\.(png|jpe?g)$/i, '.webp'))
      // Generate WebP ~80 quality and resize max width 800
      const img = sharp(input).resize({ width: 800, withoutEnlargement: true })
      await img.webp({ quality: 80 }).toFile(webpOut)
      console.log('Generated', path.basename(webpOut))
    }))
  } catch (err) {
    console.error('Image optimization failed:', err)
    process.exitCode = 0 // don't fail build if optimization fails
  }
}

optimize()