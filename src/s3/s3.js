import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.COMPANION_AWS_KEY,
  secretAccessKey: process.env.COMPANION_AWS_SECRET
})

export async function getPresignedUploadUrl (filename) {
  const key = `upload/${filename}`
  const url = await s3
    .getSignedUrl('putObject', {
      Bucket: process.env.COMPANION_AWS_BUCKET,
      Key: key,
      ContentType: 'video/*'
    })
  return url
}
