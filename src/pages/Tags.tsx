import { useState } from 'react';
import { useTags, useTagsWithStats, useCreateTag, useDeleteTag, useUpdateTag, useMergeTags, TagWithCount } from '@/hooks/useTags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Merge, Tag as TagIcon, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#78716c', '#71717a', '#64748b',
];

export default function Tags() {
  const { data: tagsWithStats = [], isLoading } = useTagsWithStats();
  const { data: allTags = [] } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const mergeTags = useMergeTags();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedTag, setSelectedTag] = useState<TagWithCount | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [mergeSourceId, setMergeSourceId] = useState('');
  const [mergeTargetId, setMergeTargetId] = useState('');

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    await createTag.mutateAsync({ name: newTagName.trim(), color: newTagColor });
    setNewTagName('');
    setNewTagColor('#6366f1');
    setCreateDialogOpen(false);
  };

  const handleEdit = async () => {
    if (!selectedTag || !newTagName.trim()) return;
    await updateTag.mutateAsync({ id: selectedTag.id, name: newTagName.trim(), color: newTagColor });
    setEditDialogOpen(false);
    setSelectedTag(null);
  };

  const handleDelete = async () => {
    if (!selectedTag) return;
    await deleteTag.mutateAsync(selectedTag.id);
    setDeleteDialogOpen(false);
    setSelectedTag(null);
  };

  const handleMerge = async () => {
    if (!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId) return;
    await mergeTags.mutateAsync({ sourceTagId: mergeSourceId, targetTagId: mergeTargetId });
    setMergeSourceId('');
    setMergeTargetId('');
    setMergeDialogOpen(false);
  };

  const openEditDialog = (tag: TagWithCount) => {
    setSelectedTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color || '#6366f1');
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (tag: TagWithCount) => {
    setSelectedTag(tag);
    setDeleteDialogOpen(true);
  };

  const totalTagged = tagsWithStats.reduce((sum, t) => sum + t.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Tags</h1>
          <p className="text-muted-foreground">
            Organize suas transações com tags personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMergeDialogOpen(true)} disabled={allTags.length < 2}>
            <Merge className="mr-2 h-4 w-4" />
            Mesclar Tags
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tag
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Tags</CardDescription>
            <CardTitle className="text-3xl">{allTags.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Transações Marcadas (mês)</CardDescription>
            <CardTitle className="text-3xl">
              {tagsWithStats.reduce((sum, t) => sum + t.transaction_count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Valor Total Marcado (mês)</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalTagged)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            Todas as Tags
          </CardTitle>
          <CardDescription>
            Estatísticas do mês atual. Clique para editar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tagsWithStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TagIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma tag criada ainda</p>
              <Button variant="link" onClick={() => setCreateDialogOpen(true)}>
                Criar primeira tag
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead className="text-right">Transações</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tagsWithStats.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-medium"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          borderColor: tag.color,
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{tag.transaction_count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(tag.total_amount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(tag)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(tag)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tag</DialogTitle>
            <DialogDescription>Crie uma nova tag para organizar suas transações</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Nome</Label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Ex: Viagem, Educação, Lazer..."
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: newTagColor === color ? 'white' : 'transparent',
                      boxShadow: newTagColor === color ? `0 0 0 2px ${color}` : 'none',
                    }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Prévia:</span>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: `${newTagColor}20`,
                  borderColor: newTagColor,
                  color: newTagColor,
                }}
              >
                {newTagName || 'Nome da tag'}
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!newTagName.trim() || createTag.isPending}>
              {createTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tag</DialogTitle>
            <DialogDescription>Altere o nome ou cor da tag</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tag-name">Nome</Label>
              <Input
                id="edit-tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: newTagColor === color ? 'white' : 'transparent',
                      boxShadow: newTagColor === color ? `0 0 0 2px ${color}` : 'none',
                    }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Prévia:</span>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: `${newTagColor}20`,
                  borderColor: newTagColor,
                  color: newTagColor,
                }}
              >
                {newTagName || 'Nome da tag'}
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={!newTagName.trim() || updateTag.isPending}>
              {updateTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesclar Tags</DialogTitle>
            <DialogDescription>
              Transfira todas as transações de uma tag para outra e exclua a tag de origem
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tag de Origem (será excluída)</Label>
              <Select value={mergeSourceId} onValueChange={setMergeSourceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a tag de origem" />
                </SelectTrigger>
                <SelectContent>
                  {allTags
                    .filter((t) => t.id !== mergeTargetId)
                    .map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tag de Destino (receberá as transações)</Label>
              <Select value={mergeTargetId} onValueChange={setMergeTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a tag de destino" />
                </SelectTrigger>
                <SelectContent>
                  {allTags
                    .filter((t) => t.id !== mergeSourceId)
                    .map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleMerge}
              disabled={!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId || mergeTags.isPending}
            >
              {mergeTags.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mesclar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Tag</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a tag "{selectedTag?.name}"? Esta ação não pode ser desfeita.
              As transações não serão afetadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTag.isPending}>
              {deleteTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
