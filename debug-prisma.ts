import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('Starting debug...')
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  try {
    // Create a test enrollment flow
    const result = await prisma.enrollmentflow.create({
      data: {
        shopId: 'test-shop',
        name: 'Test Flow',
        description: 'Test Description',
        isActive: false
      }
    })
    
    console.log('Created Flow:', result)

    // Verify we can read it back
    const flows = await prisma.enrollmentflow.findMany()
    console.log('All Flows:', flows)
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0)) 