<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Http\Requests\StoreSubscriptionRequest;
use App\Http\Requests\UpdateSubscriptionRequest;
use App\Http\Resources\SubscriptionResource;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->subscriptions();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return SubscriptionResource::collection($resources);
    }

    public function store(StoreSubscriptionRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $subscription = Subscription::create($validated);
        
        return new SubscriptionResource($subscription);
    }

    public function show(Subscription $subscription)
    {        $this->authorize('view', $subscription);
                return new SubscriptionResource($subscription);
    }

    public function update(UpdateSubscriptionRequest $request, Subscription $subscription)
    {        $this->authorize('update', $subscription);
                $subscription->update($request->validated());
        
        return new SubscriptionResource($subscription);
    }

    public function destroy(Subscription $subscription)
    {        $this->authorize('delete', $subscription);
                $subscription->delete();
        
        return response()->noContent();
    }
}
