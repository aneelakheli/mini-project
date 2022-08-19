const express = require("express");
const sharp = require("sharp");
const { getS3 } = require("../config/digitalOceanSpace");
const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const { imageUrl, isAvatar } = req.query;
  const s3 = getS3();
  try {
    const [Bucket, Key] = getBucketAndKey(imageUrl);
    await s3
      .headObject({
        Bucket,
        Key,
      })
      .promise();
    const data = s3
      .getObject({
        Bucket,
        Key,
      })
      .createReadStream();
    data.pipe(res);
  } catch (err) {
    if (err.code === "NotFound") {
      try {
        const [Bucket, Key] = getBucketAndKey(imageUrl, false);
        await s3
          .headObject({
            Bucket,
            Key,
          })
          .promise();
        createAvatarImage(s3, imageUrl);
        const data = s3
          .getObject({
            Bucket,
            Key,
          })
          .createReadStream();
        data.pipe(res);
      } catch (newError) {
        console.log(newError);
        return failCase(req, res, 404, "Such Image doesn't exist");
      }
    } else {
      failCase(req, res);
    }
  }
});

module.exports = router;
