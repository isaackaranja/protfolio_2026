// Helpers for files stored in MongoDB (GridFS), shared by CVs and the profile photo

// Saves bytes as a new stored file and returns its id
export async function storeFile(bucket, filename, bytes, contentType) {
  const upload = bucket.openUploadStream(filename, { metadata: { contentType } })
  await new Promise((resolve, reject) => {
    upload.once('finish', resolve).once('error', reject).end(bytes)
  })
  return upload.id
}

// Streams a stored file to the response.
// file: { fileId, filename, contentType, size }. disposition: 'inline' shows it, 'attachment' downloads it.
export function sendFile(res, bucket, file, { disposition = 'inline', cacheControl = 'no-cache' } = {}) {
  res.set({
    'Content-Type': file.contentType,
    'Content-Length': String(file.size),
    'Content-Disposition': `${disposition}; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
    'Cache-Control': cacheControl,
    // Browsers must trust Content-Type rather than guess, so a file can't be run as a page
    'X-Content-Type-Options': 'nosniff',
  })
  bucket
    .openDownloadStream(file.fileId)
    .on('error', (err) => {
      console.error(err)
      if (res.headersSent) res.destroy()
      else res.status(404).json({ error: 'File not found' })
    })
    .pipe(res)
}

// Matches a file's first bytes against a list of { signature } types (signature: string or byte array)
export function detectType(bytes, types) {
  return types.find(({ signature, offset = 0 }) => {
    const expected = Buffer.from(signature)
    return bytes.subarray(offset, offset + expected.length).equals(expected)
  })
}
