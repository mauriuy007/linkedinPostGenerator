export default function PostContextField({ prompt, onPromptChange }) {
  return (
    <div className="create__copy">
      <label className="create__label" htmlFor="post-context">
        Context for the post
      </label>
      <textarea
        id="post-context"
        className="create__textarea"
        placeholder="Tell the AI what you want to communicate, the tone, the goal of the post, or any important details..."
        value={prompt}
        onChange={onPromptChange}
      />
    </div>
  );
}
