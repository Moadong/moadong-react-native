import { MoaText } from '@/components/moa-text';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'introduce',
    title: '서비스 소개',
    icon: 'information-circle-outline',
    route: '/webview/introduce',
  },
  {
    id: 'club-union',
    title: '총 동아리 연합회',
    icon: 'people-outline',
    route: '/webview/club-union',
  },
];

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <Container style={{ paddingTop: insets.top }}>
      <Header>
        <HeaderTitle type="title1">더보기</HeaderTitle>
      </Header>

      <MenuList>
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            onPress={() => handleMenuPress(item.route)}
            activeOpacity={0.7}
          >
            <MenuItemContent>
              <IconContainer>
                <Ionicons name={item.icon} size={24} color="#FF5414" />
              </IconContainer>
              <MenuItemText type="body1Regular">{item.title}</MenuItemText>
            </MenuItemContent>
            <Ionicons name="chevron-forward" size={20} color="#C5C5C5" />
          </MenuItem>
        ))}
      </MenuList>
    </Container>
  );
}

// Styled Components
const Container = styled(View)`
  flex: 1;
  background-color: #fff;
`;

const Header = styled.View`
  padding-horizontal: 16px;
  padding-vertical: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #F0F0F0;
`;

const HeaderTitle = styled(MoaText)`
  color: #111111;
`;

const MenuList = styled.View`
  padding-top: 8px;
`;

const MenuItem = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 16px;
  padding-vertical: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #F5F5F5;
`;

const MenuItemContent = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const IconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #FFECE5;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const MenuItemText = styled(MoaText)`
  color: #111111;
  font-size: 16px;
`;

