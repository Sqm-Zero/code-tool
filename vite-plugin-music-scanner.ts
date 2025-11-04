import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

interface MusicItem {
  name: string;
  file: string;
  displayName: string;
}

/**
 * Vite 插件：自动扫描 music 文件夹并生成 music-list.json
 */
export function musicScanner(): Plugin {
  const musicDir = path.resolve(process.cwd(), 'public/music');
  const musicListFile = path.join(musicDir, 'music-list.json');
  
  // 支持的音频格式
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
  
  // 扫描音乐文件
  const scanMusicFiles = (): MusicItem[] => {
    if (!fs.existsSync(musicDir)) {
      fs.mkdirSync(musicDir, { recursive: true });
      return [];
    }
    
    const files = fs.readdirSync(musicDir);
    const musicFiles: MusicItem[] = [];
    
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (audioExtensions.includes(ext)) {
        const name = path.basename(file, ext);
        musicFiles.push({
          name: name,
          file: file,
          displayName: name // 默认使用文件名作为显示名称
        });
      }
    });
    
    // 按文件名排序
    musicFiles.sort((a, b) => a.name.localeCompare(b.name));
    
    return musicFiles;
  };
  
  // 生成音乐列表文件
  const generateMusicList = () => {
    const musicList = scanMusicFiles();
    
    // 读取现有文件，保留自定义的 displayName
    if (fs.existsSync(musicListFile)) {
      try {
        const existingList: MusicItem[] = JSON.parse(fs.readFileSync(musicListFile, 'utf-8'));
        const existingMap = new Map(existingList.map(item => [item.file, item.displayName]));
        
        // 合并：保留自定义的 displayName，新文件使用默认名称
        musicList.forEach(item => {
          if (existingMap.has(item.file)) {
            item.displayName = existingMap.get(item.file)!;
          }
        });
      } catch (error) {
        console.warn('读取现有 music-list.json 失败，将使用默认名称:', error);
      }
    }
    
    // 生成新的 JSON 内容
    const newJsonContent = JSON.stringify(musicList, null, 2);
    
    // 检查内容是否真的改变了，避免不必要的写入
    if (fs.existsSync(musicListFile)) {
      try {
        const existingContent = fs.readFileSync(musicListFile, 'utf-8');
        if (existingContent === newJsonContent) {
          // 内容没有变化，不需要写入
          return;
        }
      } catch (error) {
        // 读取失败，继续写入
      }
    }
    
    // 只在内容真正改变时才写入
    fs.writeFileSync(musicListFile, newJsonContent, 'utf-8');
    console.log(`✅ 已自动扫描并生成音乐列表: ${musicList.length} 首音乐`);
  };
  
  return {
    name: 'music-scanner',
    enforce: 'pre',
    buildStart() {
      generateMusicList();
    },
    configureServer(server) {
      // 开发服务器启动时先扫描一次
      generateMusicList();
      
      // 开发模式下，监听 music 文件夹变化
      if (fs.existsSync(musicDir)) {
        let debounceTimer: NodeJS.Timeout | null = null;
        
        const watcher = fs.watch(musicDir, { recursive: false }, (eventType, filename) => {
          // 忽略 music-list.json 文件的变化，避免循环触发
          if (filename === 'music-list.json' || filename === null) {
            return;
          }
          
          // 防抖处理，避免频繁触发
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          
          debounceTimer = setTimeout(() => {
            generateMusicList();
            // 通知客户端重新加载（如果 WebSocket 可用）
            if (server.ws) {
              server.ws.send({
                type: 'custom',
                event: 'music-list-updated'
              });
            }
          }, 300); // 300ms 防抖
        });
        
        server.httpServer?.once('close', () => {
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          watcher.close();
        });
      }
    }
  };
}

