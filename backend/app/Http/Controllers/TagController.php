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
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return TagResource::collection($resources);
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
