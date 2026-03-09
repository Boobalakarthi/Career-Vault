import React, { createContext, useContext, useState, useEffect } from 'react';
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
    const [creationError, setCreationError] = useState(null);

    const profileData = useLiveQuery(
        () => user ? db.profiles.where({ userId: user.id }).toArray() : null,
        [user?.id]
    );

    const profile = profileData?.[0] || null;
    const loading = profileData === undefined && !creationError;

    // Auto-create profile if user exists but profile doesn't (and it's not still loading)
    useEffect(() => {
        const initProfile = async () => {
            if (user && profileData !== undefined && profileData.length === 0) {
                try {
                    console.log("System: Initializing profile for", user.email);
                    await db.profiles.add({
                        userId: user.id,
                        email: user.email,
                        personal: { name: user.name || '', phone: '', location: '', linkedin: '', portfolio: '', bio: '' },
                        education: [],
                        experience: [],
                        skills: [],
                        projects: [],
                        certifications: []
                    });
                } catch (err) {
                    // Ignore "Key already exists" errors as they might happen during race conditions
                    if (err.name !== 'ConstraintError') {
                        console.error("Profile initialization error:", err);
                        setCreationError(err.message);
                    }
                }
            }
        };
        initProfile();
    }, [user, profileData]);

    const saveProfile = async (updatedProfile) => {
        if (!updatedProfile?.id) return;
        await db.profiles.update(updatedProfile.id, updatedProfile);
    };

    return {
        profile,
        saveProfile,
        loading,
        error: creationError
    };
};
