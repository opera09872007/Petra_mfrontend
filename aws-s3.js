import AWS from 'aws-sdk';

const getS3Object = ({
  accessKeyId,
  computeChecksums,
  secretAccessKey,
  endpoint,
  s3ForcePathStyle,
  signatureVersion,
  sslEnabled,
}) => {
  return new AWS.S3({
    accessKeyId: accessKeyId,
    computeChecksums: computeChecksums,
    secretAccessKey: secretAccessKey,
    endpoint: endpoint,
    s3ForcePathStyle: s3ForcePathStyle,
    signatureVersion: signatureVersion,
    sslEnabled: sslEnabled,
  });
};

window.getS3Object = getS3Object; // Expose getS3Object to window object
