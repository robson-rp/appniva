import { useState } from 'react';
import { Plus, X, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useTags,
  useTransactionTags,
  useCreateTag,
  useAddTagToTransaction,
  useRemoveTagFromTransaction,
  Tag,
} from '@/hooks/useTags';

interface TagManagerProps {
  transactionId: string;
}

export const TagManager = ({ transactionId }: TagManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const { data: allTags } = useTags();
  const { data: transactionTags } = useTransactionTags(transactionId);
  const createTag = useCreateTag();
  const addTag = useAddTagToTransaction();
  const removeTag = useRemoveTagFromTransaction();

  const assignedTagIds = new Set(transactionTags?.map((t) => t.id) || []);
  const availableTags = allTags?.filter((t) => !assignedTagIds.has(t.id)) || [];

  const handleAddTag = (tagId: string) => {
    addTag.mutate({ transactionId, tagId });
  };

  const handleRemoveTag = (tagId: string) => {
    removeTag.mutate({ transactionId, tagId });
  };

  const handleCreateAndAddTag = async () => {
    if (!newTagName.trim()) return;
    
    createTag.mutate(
      { name: newTagName.trim() },
      {
        onSuccess: (newTag) => {
          addTag.mutate({ transactionId, tagId: newTag.id });
          setNewTagName('');
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {transactionTags?.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="text-xs gap-1 pr-1"
          style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` }}
        >
          {tag.name}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveTag(tag.id);
            }}
            className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nova tag..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateAndAddTag();
                  }
                }}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={handleCreateAndAddTag}
                disabled={!newTagName.trim() || createTag.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {availableTags.length > 0 && (
              <div className="border-t pt-2">
                <p className="text-xs text-muted-foreground mb-2">Tags existentes</p>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer text-xs hover:bg-accent"
                      style={{ borderColor: tag.color, color: tag.color }}
                      onClick={() => handleAddTag(tag.id)}
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
