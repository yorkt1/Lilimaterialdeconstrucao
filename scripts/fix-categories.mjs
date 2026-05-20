const BASE = 'https://bklqauwvhvtnuxpwhhrf.supabase.co';
const KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbHFhdXd2aHZ0bnV4cHdoaHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzQwMzcsImV4cCI6MjA5NDgxMDAzN30.mLARNe9PWhCx-7MEPgLgGbv0z_yUeVCOQyz-VA7I1iw';
const H    = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const updates = [
  // BANHEIRO
  ['c41d4713-31c6-4528-b6ba-f300b97c8fc2', 'acessorios_banheiro'],
  ['b2bec750-b580-4575-9f71-b4a3796c642c', 'acessorios_banheiro'],
  ['9d1022d9-e791-4c9f-a9be-d35d70228c59', 'acessorios_banheiro'],
  ['a4bbd372-07eb-4e14-924e-dc29d4fc23c5', 'chuveiros_duchas'],
  ['c7a58007-2cea-47b5-92b4-6700270b55f0', 'chuveiros_duchas'],
  ['3907c4eb-8bd4-45a6-9bab-5711a59ce5de', 'acessorios_banheiro'],
  ['dd183b3b-fc30-4948-8345-ad9bfb34513c', 'chuveiros_duchas'],
  ['56b75cf2-a5f5-4f2d-a626-ce2fb3494b99', 'chuveiros_duchas'],
  ['eb857b78-eb67-4afa-aeef-ea39bb4cc3f1', 'acessorios_banheiro'],
  ['7c2e451f-7f50-4922-b9d1-9ca408d9d47f', 'cubas_pias'],
  ['50e079df-9514-4e39-8610-b570bf9312ac', 'cubas_pias'],
  ['6c1f6441-c311-427b-8ae8-4951531895de', 'cubas_pias'],
  ['8e8fcc92-2c3e-439b-8901-2966662d1abc', 'cubas_pias'],
  ['ca967f23-ef7a-43f3-8bf9-66184a681464', 'cubas_pias'],
  ['917b8b64-ee9a-42ae-a83c-034ebff27261', 'cubas_pias'],
  ['a794f720-ffad-4394-9b40-9e4a448afe4d', 'cubas_pias'],
  ['e729ee81-b5b8-48d7-997b-50b69f47595e', 'cubas_pias'],
  ['64c84c12-5fb9-4116-b3f8-473ad26ac140', 'cubas_pias'],
  ['248df533-1721-4dc4-ab77-c853ce51653f', 'acessorios_banheiro'],
  ['c72904b4-22d9-47d2-ac70-fb9ae3e74efa', 'cubas_pias'],
  ['f04624e3-b0b0-482b-b128-a229d15903f5', 'cubas_pias'],
  ['d87e3386-c129-4aeb-a16f-687cc93a0bcf', 'cubas_pias'],
  ['337c68b3-e955-424a-a1cf-55ffc326b8cb', 'cubas_pias'],
  ['ac188d2d-9605-40e8-b643-d8b339ffbf46', 'cubas_pias'],
  ['01790376-3fca-4b6c-b4c0-1a0ec48bef2c', 'cubas_pias'],
  ['d4043a2f-9a3d-4792-8e38-cd22a83635dc', 'cubas_pias'],
  ['04d94d72-275a-4fec-883e-0b025f9b4378', 'cubas_pias'],
  ['e788a8e0-6687-439d-970e-3cc2469e967d', 'cubas_pias'],
  ['1df4299f-69d1-491c-bc2b-f8638aef3378', 'cubas_pias'],
  ['cc857266-8541-4c36-9577-5083d8a0ded1', 'cubas_pias'],
  ['8b17806a-e1dd-4ae2-b137-f72245728f35', 'torneiras_misturadores'],
  ['0d0c462e-9874-49df-bd08-08d4e7aa59af', 'torneiras_misturadores'],
  ['71b039a7-6204-4bec-8e0b-bdd5be0187f0', 'torneiras_misturadores'],
  ['325acd55-8961-4b1c-b9ae-8bf425f0fe10', 'torneiras_misturadores'],
  ['de8b7fc7-8d69-4a7e-a6aa-6efe7766b5c4', 'torneiras_misturadores'],

  // MATERIAIS DE CONSTRUCAO
  ['8cd06d6f-20d1-4752-aa1f-2ae809556fd6', 'cercados_arame'],
  ['1cb0ca13-f2fa-46b4-91cf-25792314a01a', 'cercados_arame'],
  ['5721673d-74a5-47e9-9d44-552aff323fbb', 'cercados_arame'],
  ['7a6e9f6e-4efc-4c36-b246-8ec8cd381264', 'cercados_arame'],
  ['66a6ab58-c887-48e9-ad58-5eace7147e04', 'calhas_pluvial'],
  ['b5d18b16-7818-472b-943a-894e5d330a49', 'calhas_pluvial'],
  ['aa5e5067-f924-412b-a8a1-f7f1063d763f', 'calhas_pluvial'],

  // HIDRAULICA subcategorias
  ['ec3c71f3-5711-43d2-92c8-727e4d9109e0', 'tubos_conexoes'],
  ['4165f320-e0e4-4b10-beb5-e58560b6feb0', 'registros_valvulas'],
  ['1b5fa3c7-cc90-46fe-996b-e9d0f7d8373a', 'tubos_conexoes'],
  ['7d3b3909-79c1-4b7b-b89d-f63910a77a14', 'tubos_conexoes'],
  ['48f63352-f305-400d-925e-b812b36e31c2', 'tubos_conexoes'],
  ['d5270cba-ebf8-40a3-8467-1617d108c283', 'tubos_conexoes'],
  ['f8f8fcfb-4810-4b01-9295-c996e67a9469', 'tubos_conexoes'],
  ['48f9e02c-f899-4c95-9a47-49cde33ec202', 'tubos_conexoes'],
  ['461e6c39-1c24-4918-848a-fafca6ee3332', 'registros_valvulas'],
  ['c779356d-3fd4-4b8b-b747-c72d844d3f2c', 'registros_valvulas'],
  ['5e5655f5-9c22-4f8a-a2a3-afeaad0c5578', 'registros_valvulas'],
  ['a18a429c-dffb-4b0c-80f3-bf3d6d55d2ee', 'registros_valvulas'],
  ['e2476cd1-b9b8-462a-9c17-10a1dd8ffd17', 'registros_valvulas'],
  ['9c4ed0ff-80e8-4a26-a6b9-99b1bd761f59', 'registros_valvulas'],
  ['48cca63c-239d-4f77-874a-8ac274cd82ad', 'registros_valvulas'],
  ['2ff6a96c-e695-4770-a4b0-a611de5b1788', 'registros_valvulas'],
  ['17c65bd3-f574-4a04-b5b1-5a15507431ef', 'registros_valvulas'],
  ['6b188a9b-6e5b-4f5c-ae92-3516ec46e713', 'registros_valvulas'],
  ['104bdf4f-c93d-4c19-a75e-d334ec1c61c5', 'registros_valvulas'],
  ['e1c68eb2-086b-408a-a3af-2a9cc1155607', 'tubos_conexoes'],

  // PVC e Colas - separar colas
  ['8a9ea755-cca4-4e11-b3ac-09430b46d126', 'colas_silicones'],
  ['14ed4949-ab0f-4b05-8f5d-3a9dd3c78494', 'colas_silicones'],
  ['52309096-85dc-4eb9-b95b-f0381fbd6029', 'colas_silicones'],
  ['95c58c84-d626-4101-8df1-48dd3ca0f2dc', 'colas_silicones'],
  ['c215ff76-7554-4934-9eff-a91dde7a3f52', 'tubos_conexoes'],
  ['2de7f03c-ce0a-4215-9986-0fbb1bf65ead', 'tubos_conexoes'],
  ['df7037a1-cfca-4212-a513-f77961a0e664', 'tubos_conexoes'],
  ['46e05057-3a3e-461b-8296-6f8a3875f4ee', 'tubos_conexoes'],

  // ELETRICA subcategorias
  ['cc88816b-1bc0-40cb-832a-ad9bc537f261', 'eletrodutos'],
  ['df75eba0-8a14-4b27-ae84-36df79f1c98f', 'disjuntores_quadros'],

  // TINTAS subcategorias
  ['48df3b64-5ffc-4b90-8f95-bcc241f1f4bb', 'rolos_pinceis'],
  ['7ee70963-159c-45f9-bf45-80fccdb03a08', 'rolos_pinceis'],
  ['fe831372-365a-492e-bf4a-e9637e8987b2', 'rolos_pinceis'],
  ['b1fcfece-597a-49e0-9a29-6aa3d919f6bb', 'rolos_pinceis'],
  ['5a8954e3-c1d0-4a6a-80e1-7b4fda2322c5', 'rolos_pinceis'],
  ['a5d461df-78bc-4f8e-93e6-20da0aafc101', 'tintas_externas'],
  ['7d56aa4e-aecc-4fe9-9bee-5823ca6e4315', 'tintas_externas'],
  ['4c7c86db-d946-42ab-89fc-5d3301a1470a', 'vernizes_complementos'],

  // ILUMINACAO subcategorias
  ['b2587b21-007e-4941-acbb-ca1a9de6f0cf', 'lampadas'],
  ['95a4339e-a8e5-4045-a5cd-a3f60a4d941c', 'iluminacao'],
  ['2a6665b5-2cdb-461f-a726-3200032531da', 'iluminacao'],

  // FERRAMENTAS subcategorias
  ['4beef47f-c222-48ce-b3bc-9f8fbbcdf1ad', 'caixas_ferramentas'],
  ['b4e3a51a-122f-4c32-af71-5850f3e5e5f1', 'escadas'],
  ['bc886f67-e963-4496-96b5-043034535483', 'cortador_pisos'],
  ['5b6e4cdd-a5c2-405c-b9a7-56cca8dcd4a0', 'instrumentos_medicao'],
  ['2d77d5e4-3e36-47d9-a76e-06a14005366d', 'instrumentos_medicao'],
  ['d680f3bc-c4dc-44f9-9d87-00ffe27963e8', 'instrumentos_medicao'],
  ['4c3f2b88-28a0-4e56-8e71-3f8fdfbf2d2c', 'ferramentas_eletricas'],
  ['588c481b-5f21-47e9-bd71-3d43d5d91b27', 'ferramentas_manuais'],
  ['21f484ec-d93b-40e9-aced-39a099453fb5', 'ferramentas_manuais'],
  ['41140549-cb93-4fd5-814a-aa9aee0b22e6', 'ferramentas_manuais'],
  ['9ca3d43a-1f31-4979-930f-0379792699f8', 'ferramentas_manuais'],
  ['1f9157c6-bbcf-45ca-bd65-8a22c94f91af', 'ferramentas_manuais'],
  ['577b1170-c42f-4214-aac0-d918bc154d7b', 'ferramentas_manuais'],
  ['419a2e83-e583-4b4a-8673-bb59dcbdfed3', 'ferramentas_manuais'],
  ['a106ddc7-a9a0-45e6-9d0e-ca9a4432d21b', 'ferramentas_manuais'],
  ['48da1e40-3385-4a1a-8cdd-f71fbcd5af09', 'ferramentas_manuais'],
  ['551d32b1-a263-42d1-8510-2f20257d65de', 'ferramentas_manuais'],
  ['e2634d24-8296-4912-bbea-d0355f5eff8e', 'ferramentas_manuais'],
  ['f12b8e30-ef19-4e89-a3cd-78eb7fe656a7', 'ferramentas_manuais'],
  ['ee86613e-e3e9-46ca-afe6-14987534f086', 'ferramentas_manuais'],
  ['875bfdfd-e2dc-45fb-9440-b7dd397d6328', 'ferramentas_construcao'],
  ['31614b33-5696-4e31-9f59-ef4f646b240b', 'ferramentas_construcao'],
  ['1c3c107a-b9b3-4f49-a3d1-73965515b6dc', 'ferramentas_construcao'],
  ['f40e4e07-a530-4bdd-8513-77c47906922b', 'ferramentas_construcao'],
  ['c4d906e4-64ce-4266-982c-0079a17cae6b', 'ferramentas_construcao'],
  ['bfc7b9d5-bf83-4a0c-8a4c-a04eda4a0975', 'ferramentas_construcao'],
  ['4dc4de13-c85f-489d-bbfb-fc97ca7dc212', 'ferramentas_construcao'],
  ['190403d5-72a1-473c-b659-eabf82bd6799', 'ferramentas_construcao'],
  ['d729dc54-fa90-4b9b-810c-c456894b4a49', 'ferramentas_construcao'],
  ['53ff3b1b-f1cc-4f09-be16-118bd8d2eba7', 'ferramentas_construcao'],
  ['db8e1382-a8e0-4b4d-be7b-fc87c56c54a6', 'ferramentas_construcao'],
  ['4c992f29-af1d-467f-a711-33635821726a', 'ferramentas_construcao'],
  ['4bc805e1-ee15-4238-b991-18f4c90ae786', 'ferramentas_construcao'],
  ['456e9a7e-3377-4e74-b244-52c3e6ee2686', 'ferramentas_construcao'],
  ['dfeb5ee3-2498-45fd-baa0-8c8d07b81795', 'ferramentas_construcao'],
  ['11e05857-a555-4fa9-beec-39af2f4d2b3a', 'ferramentas_construcao'],
  ['855b0d44-96fe-425d-a1a9-e6c2a81c3ea6', 'acessorios_ferramentas'],
  ['da8d3d82-a9ad-4b2a-a658-e5fc088891cf', 'acessorios_ferramentas'],
  ['29416be3-ccda-476a-b519-df4533689d8a', 'acessorios_ferramentas'],
  ['a83b50dd-b149-48ef-bc89-d9885ee75e15', 'acessorios_ferramentas'],
  ['b360b462-fc83-42a5-8255-d0083bee67e0', 'acessorios_ferramentas'],
  ['d47bad1e-c628-4ef7-be54-7d6f8cfa5208', 'acessorios_ferramentas'],
  ['d6c30950-f1da-4ca4-aacc-e450b5aa52d2', 'acessorios_ferramentas'],
  ['f771cf9e-6999-48b3-b585-a7d4c404b54b', 'acessorios_ferramentas'],
  ['2d88370c-58fc-42c2-9e46-5b7ce6a8401d', 'acessorios_ferramentas'],

  // JARDIM subcategorias
  ['115b062a-4e98-44d1-951e-6a724caa4a80', 'ferramentas_jardinagem'],
  ['3ab2783f-d52a-4709-970b-2ab42e8933ba', 'ferramentas_jardinagem'],
  ['e995d046-4ab8-4dc5-b35d-32a19b9854c9', 'ferramentas_jardinagem'],

  // OUTROS -> categorias corretas
  ['ac9bf5cf-f918-48f2-b46f-023f5b8fda78', 'ferramentas_construcao'],
  ['b2996ff0-fe91-415f-a3c4-092f182dc57d', 'ferramentas_construcao'],

  // IMPERMEABILIZACAO subcategorias
  ['31a353c8-c825-4182-a177-ec4c248f3a93', 'vedantes'],
  ['26464dae-6481-4c9a-8319-8a2bef56540a', 'vedantes'],
  ['898476e7-e5cf-4605-a210-8642af2d8e67', 'selantes'],

  // PISOS subcategorias
  ['41de63b7-4dcd-49ec-89a6-a4a9d6bd2cab', 'espacadores_juntas'],
];

async function patch(id, categoria) {
  const res = await fetch(`${BASE}/rest/v1/produtos?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify({ categoria }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`ERRO ${id}: ${err}`);
    return false;
  }
  return true;
}

let ok = 0, fail = 0;
for (const [id, cat] of updates) {
  const success = await patch(id, cat);
  if (success) ok++; else fail++;
}
console.log(`Concluido: ${ok} atualizados, ${fail} erros`);
