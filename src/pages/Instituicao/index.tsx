import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SetStateAction, useState } from 'react';
import { LayoutDashboard } from '../../components/LayoutDashboard';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PlaceIcon from '@mui/icons-material/Place';
import PublicIcon from '@mui/icons-material/Public';
import { Contato } from './components/Contato';
import { Endereco } from './components/Endereco';

export default function Instituicao() {
    const [value, setValue] = useState(0);

    const handleChange = (event: any, newValue: SetStateAction<number>) => {
        setValue(newValue);
    };

    return (
        <>
            <LayoutDashboard>
                <Box sx={{  width: '100%', bgcolor: 'background.paper' }}>
                    <Tabs value={value} onChange={handleChange} centered>
                        <Tab value={0} label="Contato" icon={<AccountBoxIcon />}/>
                        <Tab value={1} label="Endereço" icon={<PlaceIcon />} />
                        <Tab value={2} label="Rede Social" icon={<PublicIcon />}/>
                    </Tabs>
                         {value === 0 && <Contato />}
                         {value === 1 && <Endereco />}

                </Box>
            </LayoutDashboard>
        </>
    );
}
