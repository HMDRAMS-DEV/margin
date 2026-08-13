export function HidePublicationButton({
  publicationId,
  publicationName,
  action,
}: {
  publicationId: string;
  publicationName: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="publicationId" value={publicationId} />
      <button
        className="hideButton"
        type="submit"
        title={`Hide future issues from ${publicationName}`}
      >
        Hide publication
      </button>
    </form>
  );
}
