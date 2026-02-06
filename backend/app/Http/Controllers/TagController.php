<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Http\Resources\TagResource;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->tags();
        
        if ($request->has('order_by')) {
            $query->orderBy($request->order_by, $request->input('order_direction', 'asc'));
        } else {
            $query->orderBy('name');
        }

        $perPage = $request->input('per_page', 100);
        $resources = $query->paginate($perPage);
        
        return TagResource::collection($resources);
    }

    public function stats(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));
        
        $tags = auth()->user()->tags()->get();
        
        $stats = $tags->map(function ($tag) use ($month) {
            $transactions = $tag->transactions()
                ->where('date', 'like', "$month%")
                ->get();
                
            return [
                'id' => $tag->id,
                'name' => $tag->name,
                'color' => $tag->color,
                'transaction_count' => $transactions->count(),
                'total_amount' => (float)$transactions->sum('amount')
            ];
        })->sortByDesc('total_amount')->values();
        
        return response()->json(['data' => $stats]);
    }

    public function merge(Request $request, Tag $tag)
    {
        $this->authorize('delete', $tag);
        
        $request->validate([
            'target_tag_id' => 'required|exists:tags,id'
        ]);
        
        $targetTagId = $request->target_tag_id;
        
        // Ensure user owns target tag
        $targetTag = auth()->user()->tags()->findOrFail($targetTagId);
        
        DB::transaction(function () use ($tag, $targetTag) {
            // Move associations
            DB::table('transaction_tags')
                ->where('tag_id', $tag->id)
                ->update(['tag_id' => $targetTag->id]);
                
            // Delete source tag
            $tag->delete();
        });
        
        return response()->json(['message' => 'Tags mescladas com sucesso']);
    }

    public function store(StoreTagRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $tag = Tag::create($validated);
        
        return new TagResource($tag);
    }

    public function show(Tag $tag)
    {        $this->authorize('view', $tag);
                return new TagResource($tag);
    }

    public function update(UpdateTagRequest $request, Tag $tag)
    {        $this->authorize('update', $tag);
                $tag->update($request->validated());
        
        return new TagResource($tag);
    }

    public function destroy(Tag $tag)
    {        $this->authorize('delete', $tag);
                $tag->delete();
        
        return response()->noContent();
    }
}
