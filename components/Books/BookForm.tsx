import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import Button from '../Common/Button';
import Input from '../Common/Input';

interface BookFormProps {
  onSubmit: (bookData: Omit<Book, 'id' | 'coverImageUrl'> & { coverImageUrl?: string }) => Promise<void>;
  initialData?: Book | null;
  onCancel?: () => void;
  submitButtonText?: string;
  isLoading?: boolean;
}

const BookForm: React.FC<BookFormProps> = ({ onSubmit, initialData, onCancel, submitButtonText = "Submit", isLoading }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAuthor(initialData.author);
      setGenre(initialData.genre);
      setTotalCopies(initialData.totalCopies);
      setCoverImageUrl(initialData.coverImageUrl || '');
    } else {
      // Reset form for new entry
      setTitle('');
      setAuthor('');
      setGenre('');
      setTotalCopies(1);
      setCoverImageUrl('');
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!author.trim()) newErrors.author = "Author is required.";
    if (!genre.trim()) newErrors.genre = "Genre is required.";
    if (totalCopies < 0) newErrors.totalCopies = "Total copies cannot be negative.";
    // Basic URL validation for cover image (optional)
    if (coverImageUrl.trim() && !coverImageUrl.match(/^(ftp|http|https):\/\/[^ "]+$/)) {
        newErrors.coverImageUrl = "Please enter a valid URL for the cover image.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit({ title, author, genre, totalCopies, coverImageUrl });
      // Optionally reset form if it's not an edit form that closes
      if (!initialData) {
        setTitle(''); setAuthor(''); setGenre(''); setTotalCopies(1); setCoverImageUrl('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <Input
        id="title"
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        required
        disabled={isLoading}
      />
      <Input
        id="author"
        label="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        error={errors.author}
        required
        disabled={isLoading}
      />
      <Input
        id="genre"
        label="Genre"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        error={errors.genre}
        required
        disabled={isLoading}
      />
      <Input
        id="totalCopies"
        label="Total Copies"
        type="number"
        value={totalCopies}
        onChange={(e) => setTotalCopies(parseInt(e.target.value, 10))}
        error={errors.totalCopies}
        min="0"
        required
        disabled={isLoading}
      />
      <Input
        id="coverImageUrl"
        label="Cover Image URL (Optional)"
        value={coverImageUrl}
        onChange={(e) => setCoverImageUrl(e.target.value)}
        error={errors.coverImageUrl}
        disabled={isLoading}
        placeholder="https://example.com/image.jpg"
      />
      <div className="flex space-x-3 pt-2">
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="ghost" disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" className="flex-grow" disabled={isLoading}>
          {isLoading ? (initialData ? 'Updating...' : 'Adding...') : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default BookForm;
