export default function ImageUploadField({ selectedImage, requiresImage, platformLabel, onImageChange }) {
  return (
    <div className="create__upload">
      <span className="create__uploadTitle">Reference image</span>
      <p className="create__uploadText">
        {requiresImage
          ? `${platformLabel} requires an image to publish the post.`
          : 'Choose an image to go along with the context you send to Gemini.'}
      </p>

      <label className="create__uploadButton" htmlFor="image-upload">
        Select image
      </label>
      <input
        id="image-upload"
        className="create__uploadInput"
        type="file"
        accept="image/*"
        onChange={onImageChange}
      />

      <p className="create__fileName">
        {selectedImage ? selectedImage.name : 'No image selected yet'}
      </p>
    </div>
  );
}
