import React from 'react';
import { motion } from 'framer-motion';
import { Tv } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="mt-16 border-t border-border/30 pt-10 pb-8 px-4"
    >
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Tv className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-extrabold text-foreground text-lg">
              Uzbekistan<span className="text-gradient">TV</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            O'zbekistonning eng qulay onlayn TV platformasi. Barcha milliy va xalqaro telekanallari jonli efirda, bepul, HD sifatda.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-xs text-muted-foreground">
          <div>
            <h3 className="font-bold text-foreground/80 mb-3 text-sm">Kategoriyalar</h3>
            <ul className="space-y-2">
              <li className="hover:text-foreground transition-colors cursor-default">Milliy kanallar</li>
              <li className="hover:text-foreground transition-colors cursor-default">Kino kanallari</li>
              <li className="hover:text-foreground transition-colors cursor-default">Sport kanallari</li>
              <li className="hover:text-foreground transition-colors cursor-default">Bolalar uchun</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-foreground/80 mb-3 text-sm">Imkoniyatlar</h3>
            <ul className="space-y-2">
              <li>Jonli efir tomosha qilish</li>
              <li>O'zbek va rus tili audio</li>
              <li>HD sifatda translatsiya</li>
              <li>Mobil qurilmalarda ishlaydi</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-foreground/80 mb-3 text-sm">Mashhur kanallar</h3>
            <ul className="space-y-2">
              <li>Zo'r TV</li>
              <li>Milliy TV HD</li>
              <li>O'zbekiston 24</li>
              <li>Sevimli TV</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-foreground/80 mb-3 text-sm">Ma'lumot</h3>
            <ul className="space-y-2">
              <li>Onlayn TV — bepul</li>
              <li>200+ telekanal</li>
              <li>Tez yuklash</li>
              <li>Ro'yxatdan o'tish shart emas</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 pt-5 text-[11px] text-muted-foreground/60 text-center">
          © {new Date().getFullYear()} UzbekistanTV — O'zbek telekanallari onlayn jonli efirda bepul tomosha qiling
        </div>
      </div>
    </motion.footer>
  );
};
