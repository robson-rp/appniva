import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Tag as TagIcon, Sparkles, Loader2 } from 'lucide-react';
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
} from '@/hooks/useTags';
import { supabase } from '@/integrations/supabase/client';

interface TagSuggestion {
  name: string;
  isExisting: boolean;
  existingTagId?: string | null;
  confidence: number;
}

interface TagManagerProps {
  transactionId: string;
  description?: string;
}

export const TagManager = ({ transactionId, description }: TagManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const { data: allTags } = useTags();
  const { data: transactionTags } = useTransactionTags(transactionId);
  const createTag = useCreateTag();
  const addTag = useAddTagToTransaction();
  const removeTag = useRemoveTagFromTransaction();

  const assignedTagIds = new Set(transactionTags?.map((t) => t.id) || []);
  const availableTags = allTags?.filter((t) => !assignedTagIds.has(t.id)) || [];

  const fetchSuggestions = useCallback(async () => {
    if (!description || description.trim().length < 3 || !isOpen) return;

    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-tags', {
        body: { description, existingTags: allTags || [] },
      });

      if (error) {
        console.error('Error fetching suggestions:', error);
        return;
      }

      if (data?.suggestions) {
        // Filter out already assigned tags
        const filteredSuggestions = data.suggestions.filter(
          (s: TagSuggestion) => !s.existingTagId || !assignedTagIds.has(s.existingTagId)
        );
        setSuggestions(filteredSuggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [description, allTags, isOpen, assignedTagIds]);

  useEffect(() => {
    if (isOpen && description) {
      fetchSuggestions();
    }
  }, [isOpen, fetchSuggestions]);

  const handleAddTag = (tagId: string) => {
    addTag.mutate({ transactionId, tagId });
    setSuggestions((prev) => prev.filter((s) => s.existingTagId !== tagId));
  };

  const handleRemoveTag = (tagId: string) => {
    removeTag.mutate({ transactionId, tagId });
  };

  const handleCreateAndAddTag = async (tagName?: string) => {
    const name = tagName || newTagName.trim();
    if (!name) return;

    createTag.mutate(
      { name },
      {
        onSuccess: (newTag) => {
          addTag.mutate({ transactionId, tagId: newTag.id });
          setNewTagName('');
          setSuggestions((prev) => prev.filter((s) => s.name.toLowerCase() !== name.toLowerCase()));
        },
      }
    );
  };

  const handleSuggestionClick = (suggestion: TagSuggestion) => {
    if (suggestion.isExisting && suggestion.existingTagId) {
      handleAddTag(suggestion.existingTagId);
    } else {
      handleCreateAndAddTag(suggestion.name);
    }
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
        <PopoverContent className="w-72 p-2" align="start">
          <div className="space-y-3">
            {/* AI Suggestions */}
            {description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Sugestões IA
                  {isLoadingSuggestions && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
                {suggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {suggestions.map((suggestion, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer text-xs hover:bg-primary/10 border-primary/30 text-primary gap-1"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Sparkles className="h-3 w-3" />
                        {suggestion.name}
                        {suggestion.isExisting && (
                          <span className="text-[10px] opacity-60">(existe)</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                ) : !isLoadingSuggestions ? (
                  <p className="text-xs text-muted-foreground italic">Sem sugestões</p>
                ) : null}
              </div>
            )}

            {/* New tag input */}
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
                onClick={() => handleCreateAndAddTag()}
                disabled={!newTagName.trim() || createTag.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Existing tags */}
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
