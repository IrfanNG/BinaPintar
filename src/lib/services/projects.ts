import { supabase, type Project } from '../supabase';

export async function getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }

    return data || [];
}

export async function getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching project:', error);
        return null;
    }

    return data;
}

export async function getActiveProjectCount(): Promise<number> {
    const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

    if (error) {
        console.error('Error counting active projects:', error);
        return 0;
    }

    return count || 0;
}

export async function createProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project | null> {
    console.log('🔵 [DEBUG] Starting createProject with:', JSON.stringify(project));

    // 0. Test connection first
    console.log('🔵 [DEBUG] Testing database connection...');
    const { data: testData, error: testError } = await supabase
        .from('projects')
        .select('id')
        .limit(1);

    if (testError) {
        console.log('❌ [DEBUG] Connection test FAILED');
        console.log('❌ [DEBUG] Test error message:', testError.message);
        console.log('❌ [DEBUG] Test error code:', testError.code);
        console.log('❌ [DEBUG] Test error full:', JSON.stringify(testError));
        return null;
    } else {
        console.log('✅ [DEBUG] Connection test PASSED, got:', testData?.length, 'rows');
    }

    // 1. Try standard insert
    console.log('🔵 [DEBUG] Attempting insert...');
    const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

    console.log('🔵 [DEBUG] Insert result - data:', data);
    console.log('🔵 [DEBUG] Insert result - error exists:', !!error);

    if (error) {
        console.log('❌ [DEBUG] Insert error.message:', error.message);
        console.log('❌ [DEBUG] Insert error.code:', error.code);
        console.log('❌ [DEBUG] Insert error.details:', error.details);
        console.log('❌ [DEBUG] Insert error.hint:', error.hint);
        console.log('❌ [DEBUG] Insert error JSON:', JSON.stringify(error));
    } else if (data) {
        console.log('✅ [DEBUG] Project created successfully!');
        return data;
    }

    // 2. Try RPC fallback
    console.log('🔄 [DEBUG] Attempting RPC...');
    const { data: rpcData, error: rpcError } = await supabase
        .rpc('create_project_secure', {
            name: project.name,
            status: project.status,
            start_date: project.start_date,
            end_date: project.end_date
        });

    console.log('🔵 [DEBUG] RPC result - data:', rpcData);
    console.log('🔵 [DEBUG] RPC result - error exists:', !!rpcError);

    if (rpcError) {
        console.log('❌ [DEBUG] RPC error.message:', rpcError.message);
        console.log('❌ [DEBUG] RPC error.code:', rpcError.code);
        console.log('❌ [DEBUG] RPC error JSON:', JSON.stringify(rpcError));
        return null;
    }

    console.log('✅ [DEBUG] Project created via RPC!');
    return rpcData as Project;
}
