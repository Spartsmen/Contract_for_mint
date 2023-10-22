import { Address, beginCell, toNano, Cell } from 'ton-core';
import { JettonMinter } from '../wrappers/JettonMinter';
import { compile, NetworkProvider } from '@ton-community/blueprint';


export async function run(provider: NetworkProvider) {

    function bufferToChunks(buff: Buffer, chunkSize: number) {
        const chunks: Buffer[] = [];
        while (buff.byteLength > 0) {
          chunks.push(buff.subarray(0, chunkSize));
          buff = buff.subarray(chunkSize);
        }
        return chunks;
      }

      function makeSnakeCell(data: Buffer): Cell {
        const chunks = bufferToChunks(data, 127);
      
        if (chunks.length === 0) {
          return beginCell().endCell();
        }
      
        if (chunks.length === 1) {
          return beginCell().storeBuffer(chunks[0]).endCell();
        }
      
        let curCell = beginCell();
      
        for (let i = chunks.length - 1; i >= 0; i--) {
          const chunk = chunks[i];
      
          curCell.storeBuffer(chunk);
      
          if (i - 1 >= 0) {
            const nextCell = beginCell();
            nextCell.storeRef(curCell);
            curCell = nextCell;
          }
        }
      
        return curCell.endCell();
      }

    function encodeOffChainContent(content: string) {
        let data = Buffer.from(content);
        const offChainPrefix = Buffer.from([0x01]);
        data = Buffer.concat([offChainPrefix, data]);
        return makeSnakeCell(data);
      }

    const link = 'ipfs://bafybeigd2yh2bkzbvlxya6m6lg6lqwh7r6iua3nv5um2zzk22ykuwzjj7a/metadata.json';
    const content = encodeOffChainContent(link)

    const jettonMinter = provider.open(JettonMinter.createFromConfig({
        
        adminAddress: provider.sender().address as Address,
        content: content,
        jettonWalletCode: await compile('JettonWallet')

    }, await compile('JettonMinter')));

    await jettonMinter.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(jettonMinter.address);

    // run methods on `jettonMinter`
}
