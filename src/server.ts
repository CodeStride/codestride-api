import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Supabase URL or Key not provided.');
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

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
});

app.post('/api/checkUsernameAvailability', async (req, res) => {
    try {
        const { username } = req.query;
        const { data, error } = await supabaseClient
            .from('users')
            .select('username')
            .eq('username', username);

        if (error) {
            throw new Error('Supabase error during username check.');
        }

        if (data.length > 0) {
            return res.status(409).json({ error: 'Username already exists.' });
        }

        return res.status(200).json({ message: 'Username is available.' });
    } catch (error) {
        throw new Error('Error checking username availability.');
    }
});

app.post('/api/calculateTotalCodeTime', async (req, res) => {
    try {
        const { userID } = req.query;
        const { data, error } = await supabaseClient
            .from('sessions')
            .select('time')
            .eq('user_id', userID);

        if (error) {
            throw new Error(
                'Supabase error during total code time calculation.',
            );
        }

        const totalTime =
            data?.reduce(
                (acc: number, row: { time: number }) => acc + row.time,
                0,
            ) || 0;

        res.status(200).json({ totalTime });
    } catch (error) {
        throw new Error('Error calculating total code time.');
    }
});

app.post('/api/sendDataToSupabase', async (req, res) => {
    try {
        const { table, columns, data } = req.body;

        if (!table || !columns || !data) {
            throw new Error('Missing required parameters.');
        }

        const columnsArray = columns.split(',');

        if (columnsArray.length !== data.length) {
            throw new Error('Number of columns does not match data.');
        }

        const dataToSend: any = {};
        columnsArray.forEach((column, index) => {
            dataToSend[column] = data[index];
        });

        const { data: response, error } = await supabaseClient
            .from(table as string)
            .upsert([dataToSend]);

        if (error) {
            throw new Error('Supabase error during data upsert.');
        }

        res.status(200).json({ success: true });
    } catch (error) {
        throw new Error('Error processing data for Supabase.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running.`);
});
