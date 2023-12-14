import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Supabase API credentials not provided.');
    process.exit(1);
}

const SUPABASE_OPTIONS = {
    auth: {
        persistSession: false,
    },
};

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    SUPABASE_OPTIONS,
);

const app = express();
const PORT = 3000;

app.use(express.json());

app.use((err, _req, res, _next) => {
    res.status(500).json({ error: 'Internal server error.' });
});

app.post('/api/checkUsernameAvailability', async (req, res) => {
    try {
        const { username } = req.query;

        if (!username || (username.length as number) <= 0) {
            return res.status(400).json({
                error: 'Invalid or missing parameters.',
            });
        }

        const { data, error } = await supabaseClient
            .from('users')
            .select('username')
            .eq('username', username);

        if (error) {
            return res
                .status(500)
                .json({ error: 'A Supabase error occurred.' });
        }

        if (data.length > 0) {
            return res.status(409).json({ error: 'Username already exists.' });
        }

        return res.status(200).json({ message: 'Username is available.' });
    } catch (error) {
        return res.status(500).json({ error: 'An unknown error occurred.' });
    }
});

app.post('/api/calculateTotalCodeTime', async (req, res) => {
    try {
        const { userID } = req.query;

        const validUUID =
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[8-9a-bA-B][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
        if (!userID || !validUUID.test(userID as string)) {
            return res.status(400).json({
                error: 'Invalid or missing parameters.',
            });
        }

        const { data, error } = await supabaseClient
            .from('sessions')
            .select('time')
            .eq('user_id', userID);

        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('user_id')
            .eq('user_id', userID);

        if (error && userError) {
            return res.status(500).json({
                error: 'A Supabase error occurred.',
            });
        }

        if (userData.length < 1) {
            return res.status(404).json({
                error: 'User not found.',
            });
        }

        const totalTime = data?.reduce((acc, row) => {
            if (row && typeof row.time === 'number') {
                return acc + row.time;
            }
            return acc;
        }, 0);

        return res.status(200).json({ totalTime });
    } catch (error) {
        return res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

app.post('/api/sendDataToSupabase', async (req, res) => {
    try {
        const { table, columns, data } = req.body;

        if (!table || !columns || !data) {
            return res.status(400).json({
                error: 'Missing required parameters.',
            });
        }

        if (table.length === 0 || columns.length === 0 || data.length === 0) {
            return res.status(400).json({
                error: 'Missing required parameters.',
            });
        }

        const columnsArray = columns.split(',');

        if (columnsArray.length !== data.length) {
            return res.status(400).json({
                error: 'Columns and data must have the same length.',
            });
        }

        if (new Set(columnsArray).size !== columnsArray.length) {
            return res.status(400).json({
                error: 'Columns must be unique.',
            });
        }

        const dataToSend = {};
        columnsArray.forEach((column, index) => {
            dataToSend[column] = data[index];
        });

        const { error } = await supabaseClient.from(table).upsert([dataToSend]);

        if (error) {
            return res
                .status(500)
                .json({ error: 'A Supabase error occurred.' });
        }

        return res
            .status(200)
            .json({ message: 'Data sent to Supabase successfully.' });
    } catch (error) {
        return res.status(500).json({ error: 'An unknown error occurred.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
