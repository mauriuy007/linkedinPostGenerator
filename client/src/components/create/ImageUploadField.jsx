export default function ImageUploadField({ selectedImage, requiresImage, platformLabel, onImageChange }) {
  return (
    <div className="create__upload">
      <span className="create__uploadTitle">Reference media</span>
      <p className="create__uploadText">
        {requiresImage
          ? `${platformLabel} requires an image to publish the post.`
          : 'Choose an image or an MP4 video to attach to your post.'}
      </p>

      <label className="create__uploadButton" htmlFor="image-upload">
        Select file
      </label>
      <input
        id="image-upload"
        className="create__uploadInput"
        type="file"
        accept={requiresImage ? 'image/*' : 'image/*,video/mp4'}
        onChange={onImageChange}
      />

      <p className="create__fileName">
        {selectedImage ? selectedImage.name : 'No file selected yet'}
      </p>
    </div>
  );
}
