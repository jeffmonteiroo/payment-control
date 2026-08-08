const { expect } = require('chai')
const { login } = require('../../helpers/login.js')
const loginData = require('../../fixture/login.json')

describe('Mutation - Login v2', () => {

    it('deve realizar login com sucesso quando informo credenciais válidas', async () => {

        const resposta = await login(loginData.admin)

        expect(resposta.status).to.equal(200)
        expect(resposta.body.data.login).to.have.property('token')
        expect(resposta.body.data.login.token).to.not.be.empty
        expect(resposta.body.data.login.token).to.be.a('string')
    })


    it('não deve realizar login quando informo credenciais inválidas', async () => {

        const usuario = {
            ...loginData.admin,
            senha: '1234567'
        }

        const resposta = await login(usuario)

        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.have.property('errors')

        expect(resposta.body.errors[0]).to.have.property(
            'message',
            'Credenciais inválidas ou usuário inativo.'
        )
    })


    it('não deve realizar login quando não informo o email', async () => {

        const usuario = {
            senha: '123456'
        }

        const resposta = await login(usuario)

        expect(resposta.status).to.equal(400)
        expect(resposta.body).to.have.property('errors')

        expect(resposta.body.errors[0].message)
            .to.include(
                'Variable "$email" of required type "String!" was not provided.'
            )
    })


    it('não deve realizar login quando não informo a senha', async () => {

        const usuario = {
            email: 'admin@admin.com'
        }

        const resposta = await login(usuario)

        expect(resposta.status).to.equal(400)
        expect(resposta.body).to.have.property('errors')

        expect(resposta.body.errors[0].message)
            .to.include(
                'Variable "$senha" of required type "String!" was not provided.'
            )
    })


    it('não deve realizar login quando informo credenciais de um usuário inativo', async () => {

        const resposta = await login(loginData.inativo)

        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.have.property('errors')

        expect(resposta.body.errors[0]).to.have.property(
            'message',
            'Credenciais inválidas ou usuário inativo.'
        )
    })

})