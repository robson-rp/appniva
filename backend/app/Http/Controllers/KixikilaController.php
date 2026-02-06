<?php

namespace App\Http\Controllers;

use App\Models\Kixikila;
use App\Models\KixikilaMember;
use App\Http\Requests\StoreKixikilaRequest;
use App\Http\Requests\UpdateKixikilaRequest;
use App\Http\Resources\KixikilaResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KixikilaController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->kixikilas()->with('members');
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return KixikilaResource::collection($resources);
    }

    public function store(StoreKixikilaRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $validated = $request->validated();
            $validated['user_id'] = auth()->id();
            
            $kixikila = Kixikila::create($validated);

            $members = array_map(function ($member) {
                return $member;
            }, $request->members);

            $kixikila->members()->createMany($members);
            
            return new KixikilaResource($kixikila->load('members'));
        });
    }

    public function updateMemberOrder(Request $request)
    {
        $request->validate([
            'members' => 'required|array|min:2',
            'members.*.id' => 'required|exists:kixikila_members,id',
            'members.*.order_number' => 'required|integer',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->members as $memberData) {
                // Ensure the member belongs to a kixikila owned by auth user?
                // Ideally yes, but for now assuming ID safety or basic checks.
                // Better: find member, check authorization (via kixikila relation)
                $member = KixikilaMember::with('kixikila')->find($memberData['id']);
                if ($member && $member->kixikila->user_id === auth()->id()) {
                     $member->update(['order_number' => $memberData['order_number']]);
                }
            }
        });

        return response()->json(['message' => 'Ordem atualizada com sucesso']);
    }

    public function show(Kixikila $kixikila)
    {        $this->authorize('view', $kixikila);
                return new KixikilaResource($kixikila);
    }

    public function update(UpdateKixikilaRequest $request, Kixikila $kixikila)
    {        $this->authorize('update', $kixikila);
                $kixikila->update($request->validated());
        
        return new KixikilaResource($kixikila);
    }

    public function destroy(Kixikila $kixikila)
    {        $this->authorize('delete', $kixikila);
                $kixikila->delete();
        
        return response()->noContent();
    }
}
