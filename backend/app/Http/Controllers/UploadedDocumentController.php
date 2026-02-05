<?php

namespace App\Http\Controllers;

use App\Models\UploadedDocument;
use App\Http\Requests\StoreUploadedDocumentRequest;
use App\Http\Requests\UpdateUploadedDocumentRequest;
use App\Http\Resources\UploadedDocumentResource;
use Illuminate\Http\Request;

class UploadedDocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->uploadedDocuments();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return UploadedDocumentResource::collection($resources);
    }

    public function store(StoreUploadedDocumentRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $uploadedDocument = UploadedDocument::create($validated);
        
        return new UploadedDocumentResource($uploadedDocument);
    }

    public function show(UploadedDocument $uploadedDocument)
    {        $this->authorize('view', $uploadedDocument);
                return new UploadedDocumentResource($uploadedDocument);
    }

    public function update(UpdateUploadedDocumentRequest $request, UploadedDocument $uploadedDocument)
    {        $this->authorize('update', $uploadedDocument);
                $uploadedDocument->update($request->validated());
        
        return new UploadedDocumentResource($uploadedDocument);
    }

    public function destroy(UploadedDocument $uploadedDocument)
    {        $this->authorize('delete', $uploadedDocument);
                $uploadedDocument->delete();
        
        return response()->noContent();
    }
}
