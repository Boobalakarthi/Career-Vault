import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from './useAuth';

/**
 * Real-time reactive profile hook.
 * Uses Dexie's liveQuery to automatically re-render
 * whenever the user's profile changes in IndexedDB.
 */
export const useProfile = () => {
    const { user } = useAuth();

    const profile = useLiveQuery(
        () => user ? db.profiles.where({ userId: user.id }).first() : null,
        [user?.id]
    );

    const createProfile = async () => {
        if (!user) return null;
        const newProfile = {
            userId: user.id,
            email: user.email,
            personal: { name: user.name || '', phone: '', location: '', linkedin: '', portfolio: '', bio: '' },
            education: [],
            experience: [],
            skills: [],
            projects: [],
            certifications: []
        };
        const id = await db.profiles.add(newProfile);
        return { ...newProfile, id };
    };

    const saveProfile = async (updatedProfile) => {
        if (!updatedProfile?.id) return;
        await db.profiles.update(updatedProfile.id, updatedProfile);
        // No need to setProfile — liveQuery will auto-update
    };

    return {
        profile,
        saveProfile,
        createProfile,
        loading: profile === undefined, // undefined = still loading, null = no profile found
    };
};
