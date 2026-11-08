/**
 * Recognition Service (Universal Core)
 */
export class RecognitionService {
    constructor(audioController) {
        this.audio = audioController;
        this.apiToken = null;
        this.coreDatabase = [
            // --- MALAY CLASSICS & HITS (Total Fluency) ---
            { title: "Isabella", artist: "Search", date: "1989", key: "Am", chords: "Am-Dm-G-C-F-Bdim-E", description: "The legendary rock anthem of Malaysia.", difficulty: "Hard" },
            { title: "Sempurna", artist: "Andra and the BackBone", date: "2007", key: "E Major", chords: "E-B-C#m-A", description: "Iconic ballad, widely practiced by beginners.", difficulty: "Easy" },
            { title: "Suci Dalam Debu", artist: "Iklim", date: "1990", key: "Em", chords: "Em-Am-D-G-C-B7", description: "Nostalgic 90s rock hit.", difficulty: "Medium" },
            { title: "Fantasia Bulan Madu", artist: "Search", date: "1986", key: "Am", chords: "Am-G-F-E", description: "Classic rock ballad for guitarists.", difficulty: "Medium" },
            { title: "Cinta Luar Biasa", artist: "Andmesh", date: "2018", key: "C Major", chords: "C-G-Am-F", description: "Popular modern pop with simple progression.", difficulty: "Easy" },
            { title: "Belaian Jiwa", artist: "Innuendo", date: "1997", key: "F Major", chords: "F-Dm-Gm-C", description: "Smooth R&B harmony.", difficulty: "Medium" },
            { title: "Janji Manismu", artist: "Aishah", date: "1990", key: "G Major", chords: "G-Em-C-D", description: "A pop masterpiece of the 90s.", difficulty: "Easy" },
            { title: "Ghazal Untuk Rabiah", artist: "M. Nasir", date: "1995", key: "Dm", chords: "Dm-Gm-A-Dm", description: "Traditional fusion elements.", difficulty: "Hard" },
            { title: "Sinaran", artist: "Sheila Majid", date: "1986", key: "Bb Major", chords: "Bb-Cm-D7-Gm", description: "The Jazz-Pop queen of Malaysia.", difficulty: "Medium" },
            { title: "Memori Berkasih", artist: "Achik & Nana", date: "2001", key: "Am", chords: "Am-Dm-G-C-E", description: "The ultimate duet karaoke song.", difficulty: "Easy" },
            { title: "Mungkin Nanti", artist: "Peterpan", date: "2004", key: "G Major", chords: "G-Bm-C-D", description: "Every Malay/Indo guitarist's first song.", difficulty: "Easy" },
            { title: "Sekuntum Mawar Merah Sebuah Puisi", artist: "Alleycats", date: "1980", key: "C Major", chords: "C-F-G-C", description: "Legendary pop ballad from the Alleycats.", difficulty: "Easy" },
            { title: "Tanya Sama Itu Hud Hud", artist: "M. Nasir", date: "1994", key: "Am", chords: "Am-Dm-F-E", description: "Philosophical folk-rock.", difficulty: "Hard" },
            { title: "Lagu Jiwa Kacau", artist: "Hujan", date: "2008", key: "E Major", chords: "E-A-B", description: "Indie-rock staple.", difficulty: "Medium" },
            { title: "Aku Skandal", artist: "Hujan", date: "2008", key: "A Major", chords: "A-D-E", description: "High energy indie rock.", difficulty: "Medium" },
            { title: "Kenangan Terindah", artist: "Samsons", date: "2005", key: "G Major", chords: "G-D-Em-C", description: "Heartfelt ballad with clear chords.", difficulty: "Easy" },
            { title: "Menghitung Hari", artist: "Krisdayanti", date: "1998", key: "C Major", chords: "C-Am-Dm-G", description: "Emotional soulful performance.", difficulty: "Medium" },
            { title: "Gerhana", artist: "Kembara", date: "1982", key: "Am", chords: "Am-E-G-D", description: "Folk-rock roots with M. Nasir.", difficulty: "Medium" },
            { title: "Kasih Latifa", artist: "Spider", date: "2003", key: "D Major", chords: "D-A-Bm-G", description: "Ska-rock catchy progression.", difficulty: "Easy" },
            { title: "Relaku Pujuk", artist: "Spider", date: "2004", key: "G Major", chords: "G-C-D", description: "Pop-rock favorite.", difficulty: "Easy" },
            { title: "Ayam Den Lapeh", artist: "Traditional", date: "Classic", key: "C Major", chords: "C-G-C", description: "Famous Minangkabau folk song.", difficulty: "Easy" },
            { title: "Getaran Jiwa", artist: "P. Ramlee", date: "1960", key: "C Major", chords: "C-Dm-G7-C", description: "The legacy of Tan Sri P. Ramlee.", difficulty: "Medium" },
            { title: "Madu Dan Racun", artist: "Bill & Brod", date: "1985", key: "F Major", chords: "F-Bb-C", description: "Retro pop dance hit.", difficulty: "Easy" },
            { title: "Kau Ilhamku", artist: "Man Bai", date: "1995", key: "G Major", chords: "G-D-Em-C", description: "Inspirational acoustic classic.", difficulty: "Easy" },
            { title: "Sendiri", artist: "May", date: "1989", key: "Em", chords: "Em-C-D-Em", description: "Powerful heavy metal ballad.", difficulty: "Hard" },
            { title: "Taman Rashidah Utama", artist: "Wings", date: "1988", key: "Am", chords: "Am-G-F-E", description: "Iconic rock performance by Awie.", difficulty: "Hard" },
            { title: "Sejati", artist: "Wings", date: "1990", key: "Am", chords: "Am-F-G-Am", description: "Legendary hard rock ballad.", difficulty: "Hard" },
            { title: "Misteri Mimpi Syakilla", artist: "Wings", date: "1989", key: "Em", chords: "Em-C-D-Em", description: "Complex rock arrangements.", difficulty: "Hard" },
            { title: "Nirmala", artist: "Siti Nurhaliza", date: "2002", key: "Dm", chords: "Dm-A-Bb-A", description: "Traditional Irama Malaysia at its best.", difficulty: "Hard" },
            { title: "Cindai", artist: "Siti Nurhaliza", date: "1997", key: "Am", chords: "Am-Dm-G-C-E", description: "The most famous Malay traditional pop song.", difficulty: "Hard" },
            { title: "Bukan Cinta Biasa", artist: "Siti Nurhaliza", date: "2003", key: "E Major", chords: "E-A-B-E", description: "Modern pop ballad by Dato' Siti.", difficulty: "Medium" },
            { title: "Hanya Kau Yang Mampu", artist: "Aizat Amdan", date: "2008", key: "C Major", chords: "C-G-Am-F", description: "Soulful acoustic pop.", difficulty: "Easy" },
            { title: "Sungai Lui", artist: "Aizat Amdan", date: "2010", key: "G Major", chords: "G-Em-C-D", description: "Beautiful acoustic melody.", difficulty: "Easy" },
            { title: "Kopi Dangdut", artist: "Fahmi Shahab", date: "1991", key: "Am", chords: "Am-G-F-E", description: "Infectious dance rhythm.", difficulty: "Medium" },
            { title: "Sakitnya Tuh Disini", artist: "Cita Citata", date: "2014", key: "Am", chords: "Am-Dm-G-C", description: "Modern Dangdut sensation.", difficulty: "Easy" },
            { title: "Lagu Untukmu", artist: "Meet Uncle Hussain", date: "2008", key: "D Major", chords: "D-A-Bm-G", description: "Alternative rock chart topper.", difficulty: "Medium" },
            { title: "Pokok", artist: "Meet Uncle Hussain ft. Nubhan", date: "2011", key: "Am", chords: "Am-F-G", description: "Unique alternative melody.", difficulty: "Medium" },
            { title: "Encik Mimpi", artist: "Rindu Di Awan Biru", date: "2013", key: "C Major", chords: "C-Gsus4-Am7-F", description: "Gentle acoustic pop.", difficulty: "Easy" },
            { title: "Awan Nano", artist: "Hafiz Suip", date: "2011", key: "Ab Major", chords: "Ab-Eb-Fm-Db", description: "Grand orchestral ballad.", difficulty: "Hard" },
            { title: "Bahagiamu Deritaku", artist: "Hafiz Suip", date: "2013", key: "Bb Major", chords: "Bb-F-Gm-Eb", description: "Powerful vocal showcase.", difficulty: "Hard" },
            { title: "Assalammualaikum", artist: "Faizal Tahir", date: "2015", key: "G Major", chords: "G-C-D", description: "Modern message-driven pop.", difficulty: "Medium" },
            { title: "Ragaman", artist: "Faizal Tahir", date: "2018", key: "C Major", chords: "C-F-G", description: "Upbeat retro-vibe pop.", difficulty: "Medium" },
            { title: "Kisah Kita", artist: "Hael Husaini", date: "2017", key: "Fm", chords: "Fm-Db-Eb-C7", description: "Modern catchy pop.", difficulty: "Medium" },
            { title: "Haram", artist: "Hael Husaini & Dayang Nurfaizah", date: "2018", key: "Am", chords: "Am-Dm-G-C", description: "Soulful modern duet.", difficulty: "Medium" },
            { title: "Peluang Kedua", artist: "Nabila Razali", date: "2020", key: "C Major", chords: "C-G-Am-F", description: "Minimalist emotional ballad.", difficulty: "Easy" },
            { title: "Sumpah", artist: "Naim Daniel", date: "2019", key: "C Major", chords: "C-G-Am-F", description: "Heartbreaking modern ballad.", difficulty: "Easy" },
            { title: "Mimpi", artist: "K-Clique", date: "2019", key: "Bm", chords: "Bm-G-A", description: "Modern Malay Hip-Hop anthem.", difficulty: "Medium" },
            { title: "Ciao", artist: "Joe Flizzow ft. MK, Jay Park", date: "2021", key: "F#m", chords: "F#m-D-E", description: "Top tier Malay Rap collaboration.", difficulty: "Hard" },
            { title: "Teman", artist: "Iman Troye", date: "2020", key: "Bb Major", chords: "Bb-Eb-F", description: "Infectious viral pop.", difficulty: "Easy" },
            { title: "Purnama", artist: "Naim Daniel", date: "2021", key: "D Major", chords: "D-A-Bm-G", description: "Rich acoustic pop arrangement.", difficulty: "Medium" },

            // --- GREATEST CHINESE HITS (Mandopop / Cantopop) ---
            { title: "Yue Liang Dai Biao Wo De Xin", artist: "Teresa Teng", date: "1977", key: "Eb Major", chords: "Eb-Cm-Fm-Bb", description: "The most famous Chinese song of all time.", difficulty: "Easy" },
            { title: "Tong Hua", artist: "Michael Wong", date: "2005", key: "F Major", chords: "F-Bb-C-Dm", description: "A heartwarming modern classic.", difficulty: "Easy" },
            { title: "Wen Bie", artist: "Jacky Cheung", date: "1993", key: "G Major", chords: "G-C-Am-D", description: "The 'Goodbye Kiss' anthem.", difficulty: "Medium" },
            { title: "Hai Kuo Tian Kong", artist: "Beyond", date: "1993", key: "F Major", chords: "F-Bb-C", description: "Legendary HK Rock anthem for freedom.", difficulty: "Medium" },
            { title: "Hou Lai", artist: "Rene Liu", date: "2000", key: "C Major", chords: "C-Am-F-G", description: "Nostalgic song about lost love.", difficulty: "Easy" },
            { title: "Qian Nian Deng Yi Hui", artist: "Gao Sheng Mei", date: "1992", key: "G Major", chords: "G-Em-C-D", description: "Theme from New Legend of Madame White Snake.", difficulty: "Medium" },
            { title: "Peng You", artist: "Wakin Chau", date: "1997", key: "G Major", chords: "G-D-Em-C", description: "The ultimate song about friendship.", difficulty: "Easy" },
            { title: "Tian Mi Mi", artist: "Teresa Teng", date: "1979", key: "D Major", chords: "D-Bm-G-A", description: "Sweet and timeless classic.", difficulty: "Easy" },
            { title: "Piao Yang Guo Hai Lai Kan Ni", artist: "Wakin Chau", date: "1991", key: "D Major", chords: "D-G-A-Bm", description: "A touching long-distance love song.", difficulty: "Medium" },
            { title: "Guang Hui Sui Yue", artist: "Beyond", date: "1990", key: "E Major", chords: "E-A-B-C#m", description: "Tribute to Nelson Mandela.", difficulty: "Hard" },
            { title: "Zhen De Ai Ni", artist: "Beyond", date: "1989", key: "C Major", chords: "C-G-Am-F", description: "Tribute to mothers everywhere.", difficulty: "Medium" },
            { title: "Dan Yuan Ren Chang Jiu", artist: "Faye Wong", date: "1995", key: "D Major", chords: "D-Bm-G-A", description: "Based on a famous Song Dynasty poem.", difficulty: "Medium" },
            { title: "Ketchup", artist: "Joey Yung", date: "2000s", key: "C Major", chords: "C-Am-F-G", description: "Cantopop energetic hit.", difficulty: "Medium" },
            { title: "Fuji Shan Xia", artist: "Eason Chan", date: "2006", key: "C Major", chords: "C-Am-Dm-G", description: "Profound ballad about letting go.", difficulty: "Medium" },
            { title: "Shi Nian", artist: "Eason Chan", date: "2003", key: "G Major", chords: "G-Em-C-D", description: "Ten Years - A karaoke staple.", difficulty: "Easy" },
            { title: "Xiao Xing Yun", artist: "Hebe Tien", date: "2015", key: "F Major", chords: "F-Bb-C", description: "Theme from 'Our Times'.", difficulty: "Easy" },
            { title: "Gao Bai Qi Qiu", artist: "Jay Chou", date: "2016", key: "B Major", chords: "B-E-F#", description: "Sweet R&B love confession.", difficulty: "Easy" },
            { title: "Qing Hua Ci", artist: "Jay Chou", date: "2007", key: "G Major", chords: "G-Em-C-D", description: "Blue and White Porcelain.", difficulty: "Medium" },
            { title: "Dao Xiang", artist: "Jay Chou", date: "2008", key: "A Major", chords: "A-D-E", description: "Reminiscing about simple country life.", difficulty: "Easy" },
            { title: "Long Juan Feng", artist: "Jay Chou", date: "2001", key: "A Minor", chords: "Am-F-G-C", description: "Tornado - Power ballad.", difficulty: "Medium" },
            { title: "An Jing", artist: "Jay Chou", date: "2001", key: "Bb Minor", chords: "Bbm-Gb-Ab-Db", description: "Silence - Heartbreaking piano ballad.", difficulty: "Medium" },
            { title: "Jiang Nan", artist: "JJ Lin", date: "2004", key: "G Minor", chords: "Gm-Eb-F-Bb", description: "River South - Distinctive fusion style.", difficulty: "Medium" },
            { title: "Yi Qian Nian Yi Hou", artist: "JJ Lin", date: "2005", key: "Bb Major", chords: "Bb-Gm-Eb-F", description: "A Thousand Years Later.", difficulty: "Medium" },
            { title: "Xiu Lian Ai Qing", artist: "JJ Lin", date: "2013", key: "C Major", chords: "C-G-Am-F", description: "Practice Love - True story based ballad.", difficulty: "Medium" },
            { title: "Bu Wei Shei Er Zuo De Ge", artist: "JJ Lin", date: "2015", key: "F Major", chords: "F-C-Dm-Bb", description: "Twilight - Vocal powerhouse.", difficulty: "Hard" },
            { title: "Mo Te", artist: "Li Ronghao", date: "2013", key: "Eb Major", chords: "Eb-Ab-Bb", description: "Model - Chill R&B vibe.", difficulty: "Medium" },
            { title: "Li Bai", artist: "Li Ronghao", date: "2013", key: "G Major", chords: "G-Em-C-D", description: "Upbeat pop-rock.", difficulty: "Easy" },
            { title: "Nian Shao You Wei", artist: "Li Ronghao", date: "2018", key: "C Major", chords: "C-Am-F-G", description: "If I Were Young - Emotional regret.", difficulty: "Easy" },
            { title: "Ti Mian", artist: "Kelly Yu", date: "2017", key: "Bb Major", chords: "Bb-Gm-Eb-F", description: "Decency - Breakup anthem.", difficulty: "Medium" },
            { title: "Shuo San Jiu San", artist: "JC", date: "2016", key: "F Major", chords: "F-Bb-C", description: "Viral hit about moving on.", difficulty: "Easy" },
            { title: "Gu Yong Zhe", artist: "Eason Chan", date: "2021", key: "D Minor", chords: "Dm-Bb-C-F", description: "Lonely Warrior - Arcane Theme.", difficulty: "Hard" },
            { title: "Re Ai 105 Du De Ni", artist: "A Si", date: "2019", key: "C Major", chords: "C-F-G", description: "Super idol viral cute song.", difficulty: "Easy" },
            { title: "Xue Mao Jiao", artist: "Xiao Pan Pan", date: "2018", key: "C Major", chords: "C-Am-F-G", description: "Learn to Meow - Viral cute song.", difficulty: "Easy" },
            { title: "Mang Zhong", artist: "Zhao Fangjing", date: "2019", key: "C Minor", chords: "Cm-Ab-Bb-Eb", description: "Grain in Ear - Catchy rhythm.", difficulty: "Medium" },
            { title: "Shao Nian", artist: "Meng Ran", date: "2019", key: "G Major", chords: "G-D-Em-C", description: "Youth - Inspirational.", difficulty: "Easy" },
            { title: "Ke Xi Mei Ru Guo", artist: "JJ Lin", date: "2014", key: "C Major", chords: "C-G-Am-F", description: "If Only - Deep ballad.", difficulty: "Medium" },
            { title: "Chi Bang", artist: "Power Station", date: "1997", key: "D Major", chords: "D-G-A", description: "Walking on Zhongxiao East Road.", difficulty: "Medium" },
            { title: "Dang", artist: "Power Station", date: "1998", key: "G Major", chords: "G-D-Em-C", description: "Theme from Princess Pearl.", difficulty: "Hard" },
            { title: "Wo De Wei Lai Bu Shi Meng", artist: "Chang Yu-sheng", date: "1988", key: "G Major", chords: "G-C-D", description: "My Future is Not a Dream.", difficulty: "High" },
            { title: "Da Hai", artist: "Chang Yu-sheng", date: "1992", key: "F Major", chords: "F-Bb-C", description: "The Ocean - Soaring vocals.", difficulty: "Hard" },
            { title: "Dan Shen Qing Ge", artist: "Terry Lin", date: "1999", key: "Am", chords: "Am-G-F-E", description: "Single's Love Song.", difficulty: "Medium" },
            { title: "Luo Ye Gui Gen", artist: "Wang Leehom", date: "2007", key: "C Major", chords: "C-G-Am-Em", description: "Falling Leaf Returns to Roots.", difficulty: "Medium" },
            { title: "Wei Yi", artist: "Wang Leehom", date: "2001", key: "C Major", chords: "C-Am-F-G", description: "The One - Romantic classic.", difficulty: "Easy" },
            { title: "Ni Bu Zhi Dao De Shi", artist: "Wang Leehom", date: "2010", key: "C Major", chords: "C-G-Am-F", description: "What You Don't Know.", difficulty: "Medium" },
            { title: "Gai Bian Zi Ji", artist: "Wang Leehom", date: "2007", key: "C Major", chords: "C-F-G", description: "Change Myself - Upbeat.", difficulty: "Easy" },
            { title: "Xiao Jiu Wo", artist: "JJ Lin & Charlene Choi", date: "2008", key: "C Major", chords: "C-G-Am-F", description: "Small Dimples - Sweet duet.", difficulty: "Easy" },
            { title: "Jin Tian Ni Yao Jia Gei Wo", artist: "David Tao & Jolin Tsai", date: "2006", key: "D Major", chords: "D-G-A", description: "Marry Me Today.", difficulty: "Easy" },
            { title: "Ai Hen Jian Dan", artist: "David Tao", date: "1997", key: "C Major", chords: "C-Am-F-G", description: "Love is Simple.", difficulty: "Medium" },
            { title: "Melody", artist: "David Tao", date: "2002", key: "F Major", chords: "F-Dm-Bb-C", description: "Complex R&B chords.", difficulty: "Hard" },
            { title: "Dao Dai", artist: "Jolin Tsai", date: "2004", key: "C Major", chords: "C-G-Am-F", description: "Rewind - Pop punk ballad.", difficulty: "Easy" }
        ];
        this.localDatabase = [...this.coreDatabase];
        this.loadLattice();
    }

    async syncLattice(onProgress) {
        try {
            console.log("🔄 Initiating Deep Lattice Sync...");
            // EXPANDED ASIAN MARKET COVERAGE (Total Fluency)
            const regions = ['cn', 'hk', 'tw', 'sg', 'my', 'jp', 'kr', 'us', 'gb', 'in'];
            let syncedTracks = [];
            for (let i = 0; i < regions.length; i++) {
                const region = regions[i];
                if (onProgress) onProgress(`Syncing ${region.toUpperCase()}...`);
                try {
                    const res = await fetch(`https://rss.applemarketingtools.com/api/v2/${region}/music/most-played/10/songs.json`);
                    const data = await res.json();
                    if (data.feed && data.feed.results) {
                        const batch = data.feed.results.map(s => ({
                            title: s.name,
                            artist: s.artistName,
                            date: s.releaseDate,
                            key: "Latice (Auto)",
                            chords: "Analysis Ready",
                            description: `🌌 ${region.toUpperCase()} Trend Node`
                        }));
                        syncedTracks = [...syncedTracks, ...batch];
                    }
                } catch (e) { }
            }
            if (syncedTracks.length > 0) {
                this.persistLattice(syncedTracks);
                this.loadLattice();
                return { success: true };
            }
        } catch (e) { }
        return { success: false };
    }

    persistLattice(tracks) {
        localStorage.setItem('lattice-data', JSON.stringify(tracks));
        localStorage.setItem('lattice-last-sync', Date.now());
    }

    loadLattice() {
        const stored = localStorage.getItem('lattice-data');
        if (stored) {
            const syncedTracks = JSON.parse(stored);
            this.localDatabase = [...syncedTracks, ...this.coreDatabase];
        }
    }

    checkSyncExpiry() {
        const lastSync = localStorage.getItem('lattice-last-sync');
        if (!lastSync) return true;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        return (Date.now() - parseInt(lastSync)) > sevenDays;
    }

    getSuggestions(song) {
        return this.localDatabase
            .filter(s => s.title !== song.title && (s.key === song.key || s.difficulty === "Easy"))
            .slice(0, 4);
    }

    async identify(onStatusUpdate) {
        if (!this.audio.stream) return { error: true, message: "Microphone required." };
        if (!this.apiToken) {
            const token = prompt("Enter AudD API Token:", "");
            this.apiToken = token || "test";
        }
        if (onStatusUpdate) onStatusUpdate("COSMIC SCANNING...");
        let finalResult = null;
        try {
            // Updated for Sharper Listening (longer check window)
            const result = await this.recordAudioWithEarlyExit(5000, 3500, async (partialBlob) => {
                if (onStatusUpdate) onStatusUpdate("LATTICE SYNCING...");
                const [apiResult, localAnalysis] = await Promise.all([this.sendToAPI(partialBlob), this.analyzeAudio(partialBlob)]);
                if (!apiResult.error) {
                    Object.assign(apiResult, localAnalysis);
                    finalResult = apiResult;
                    return true;
                }
                return false;
            });
            if (finalResult) return finalResult;
            if (onStatusUpdate) onStatusUpdate("DEEP SCANNING...");
            const [apiResult, localAnalysis] = await Promise.all([this.sendToAPI(result), this.analyzeAudio(result)]);
            finalResult = apiResult;
            if (!finalResult.error) Object.assign(finalResult, localAnalysis);
        } catch (err) { }
        if (!finalResult || finalResult.error) {
            const random = this.localDatabase[Math.floor(Math.random() * this.localDatabase.length)];
            return { ...random, isSimulation: true };
        }
        return finalResult;
    }

    async recordAudioWithEarlyExit(maxMs, checkMs, onCheckpoint) {
        return new Promise((resolve) => {
            const mediaRecorder = new MediaRecorder(this.audio.stream);
            let chunks = [];
            let earlyExitCalled = false;
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/mp3' }));
            mediaRecorder.start(500);
            setTimeout(async () => {
                const shouldExit = await onCheckpoint(new Blob(chunks, { type: 'audio/mp3' }));
                if (shouldExit) { earlyExitCalled = true; mediaRecorder.stop(); }
            }, checkMs);
            setTimeout(() => { if (mediaRecorder.state !== "inactive") mediaRecorder.stop(); }, maxMs);
        });
    }

    async sendToAPI(blob) {
        const formData = new FormData();
        formData.append("api_token", this.apiToken);
        formData.append("file", blob);
        formData.append("return", "apple_music,spotify");
        try {
            const response = await fetch("https://api.audd.io/", { method: "POST", body: formData });
            const result = await response.json();
            if (result.status === "success" && result.result) {
                return { title: result.result.title, artist: result.result.artist, date: result.result.release_date || "Unknown" };
            }
        } catch (err) { }
        return { error: true };
    }

    async analyzeAudio(blob) {
        // Mock analysis - in a real engine, this would use spectral centroid
        // for sharper clarity estimation.
        return { key: "C Major", chords: "C-G-Am-F", difficulty: "Medium" };
    }
}
