import React from 'react';
import { Tv } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-border pt-8 pb-6 px-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-foreground">
              Uzbekistan<span className="text-primary">TV</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            O'zbekistonning eng qulay onlayn TV platformasi. Barcha milliy va xalqaro telekanallari jonli efirda, bepul, HD sifatda.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-xs text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Kategoriyalar</h3>
            <ul className="space-y-1">
              <li>Milliy kanallar</li>
              <li>Kino kanallari</li>
              <li>Sport kanallari</li>
              <li>Bolalar uchun</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Imkoniyatlar</h3>
            <ul className="space-y-1">
              <li>Jonli efir tomosha qilish</li>
              <li>O'zbek va rus tili audio</li>
              <li>HD sifatda translatsiya</li>
              <li>Mobil qurilmalarda ishlaydi</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Mashhur kanallar</h3>
            <ul className="space-y-1">
              <li>Zo'r TV</li>
              <li>Milliy TV HD</li>
              <li>O'zbekiston 24</li>
              <li>Sevimli TV</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Ma'lumot</h3>
            <ul className="space-y-1">
              <li>Onlayn TV — bepul</li>
              <li>200+ telekanal</li>
              <li>Tez yuklash</li>
              <li>Ro'yxatdan o'tish shart emas</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-4 text-[10px] text-muted-foreground text-center">
          © {new Date().getFullYear()} UzbekistanTV — O'zbek telekanallari onlayn jonli efirda bepul tomosha qiling
        </div>
      </div>
    </footer>
  );
};